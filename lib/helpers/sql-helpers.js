/**
 * @param {*} key
 * @returns {string}
 */
function sanitisedKey (key) {
  return (key + '').replace(/[^a-zA-Z0-9_-]/g, '_')
}
const sane = sanitisedKey

/**
 * @param {Object.<string, string>[]} orderColumns
 * @returns {Object[]}
 */
function orderColumnsToKV (orderColumns) {
  return _.map(orderColumns, (columnDef) => _.first(_.map(columnDef, (value, key) => ({ key, value }))))
}

function stringSaneFunction () {
  return `function sane(key) {
    return (key + '').replace(/[^a-zA-Z0-9_-]/g, '_')
}`
}

const mysql = require('mysql2/promise')
const AWS = require('aws-sdk')
const _ = require('lodash')

/**
 * @type {Connection}
 */
let persistentConnection = null

async function createConnection (config) {
  if(config.isRDS && !config.password) {
    await _createConnectionViaAWSIAM(config)
    return
  }
  await _createConnectionViaPassword(config)
}

/**
 * @returns {Promise<Connection>}
 */
async function _createConnectionViaPassword (config) {
  if (persistentConnection) {
    return persistentConnection
  }
  const {host, port, username, password, database} = config
  const connectionOptions = {
    host: host,
    user: username,
    password: password,
    port: port,
    ssl: config.isRDS ? 'Amazon RDS' : null,
    database: database
  }
  const connection = await mysql.createConnection(connectionOptions)
  persistentConnection = connection
  return connection
}

/**
 * @param {Object} config
 * @returns {Promise<Connection>}
 */
async function _createConnectionViaAWSIAM (config) {
  const {region, host, port, username, database} = config

  const signer = new AWS.RDS.Signer({
    region: region,
    username: username,
    hostname: host,
    port: port
  })
  const token = await signer.getAuthToken({})
  const connectionOptions = {
    host: host,
    user: username,
    password: token,
    port: port,
    ssl: 'Amazon RDS',
    database: database,
    authPlugins: {
      mysql_clear_password: () => () => token
    }
  }
  persistentConnection = await mysql.createConnection(connectionOptions)
  return persistentConnection
}

/**
 * @returns {Promise<Connection>}
 */
async function getConnection () {
  if (persistentConnection) {
    return persistentConnection
  }
}

async function callQuery (query) {
  const connection = await getConnection()
  console.debug(`RUNNING QUERY = ${query}`)
  const [rows] = await connection.query(query)
  return rows
}

async function killConnection () {
  if (!persistentConnection) {
    return
  }
  try {
    await persistentConnection.end()
  } catch (error) {
    console.error(error.message)
  }
}

/**
 * @param {String} database
 * @returns {Promise<String[]>}
 *
 * @example
 * SQL return example
 * [TextRow {
 *    Name: 'tool',
 *    Engine: 'InnoDB',
 *    Version: 10,
 *    Row_format: 'Dynamic',
 *    Rows: 0,
 *    Avg_row_length: 0,
 *    Data_length: 16384,
 *    Max_data_length: 0,
 *    Index_length: 0,
 *    Data_free: 0,
 *    Auto_increment: null,
 *    Create_time: 2021-09-28T09:45:59.000Z,
 *    Update_time: null,
 *    Check_time: null,
 *    Collation: 'utf8mb4_0900_ai_ci',
 *    Checksum: null,
 *    Create_options: '',
 *    Comment: 'Table of tools, aka trufflehog / semgrep etc'
 *  },]
 */
async function readTablesDef (database) {
  const rawSql = `SHOW TABLE STATUS FROM \`${sane(database)}\``
  const tablesDef = await callQuery(rawSql)
  const tables = _.map(tablesDef, (value) => sane(value.Name))
  return tables
}

/**
 * @param {String} database
 * @param {String} table
 * @returns {Promise<Object[]>}
 *
 * @example
 * SQL return example
 * [{
 *     "TABLE_CATALOG": "def",
 *     "TABLE_SCHEMA": "test",
 *     "TABLE_NAME": "codebase",
 *     "COLUMN_NAME": "id",
 *     "ORDINAL_POSITION": 1,
 *     "COLUMN_DEFAULT": null,
 *     "IS_NULLABLE": "NO",
 *     "DATA_TYPE": "int",
 *     "CHARACTER_MAXIMUM_LENGTH": null,
 *     "CHARACTER_OCTET_LENGTH": null,
 *     "NUMERIC_PRECISION": 10,
 *     "NUMERIC_SCALE": 0,
 *     "DATETIME_PRECISION": null,
 *     "CHARACTER_SET_NAME": null,
 *     "COLLATION_NAME": null,
 *     "COLUMN_TYPE": "int",
 *     "COLUMN_KEY": "PRI",
 *     "EXTRA": "auto_increment",
 *     "PRIVILEGES": "select",
 *     "COLUMN_COMMENT": "Primary ID",
 *     "GENERATION_EXPRESSION": "",
 *     "SRS_ID": null
 * },]
 */
async function readTableColumnsDef (database, table) {
  const rawSql = `SELECT * FROM \`information_schema\`.\`COLUMNS\` WHERE TABLE_SCHEMA='${sane(database)}' AND TABLE_NAME='${sane(table)}' ORDER BY ORDINAL_POSITION`
  return await callQuery(rawSql)
}

/**
 * convert db type into js type
 * @param {string} sqlDataType
 * @returns {string}
 */
function _convertSqlToJSDataType (sqlDataType) {
  switch (sqlDataType) {
    case 'int':
      return 'number'
    case 'double':
      return 'number'
    case 'text':
      return 'string'
    case 'varchar':
      return 'string'
    case 'tinyint':
      return 'boolean'
    case 'timestamp':
      return 'string'
    default:
      console.log(`no js mapping for sql Data Type: ${sqlDataType} (defaulting to string)`)
      return 'string'
  }
}

/**
 * @param {Object[]} sqlTableDef
 * @returns {Object}
 */
function createJSTableDef (sqlTableDef) {
  if (!sqlTableDef.length) {
    throw new Error('Empty database table given')
  }
  const table = _.first(sqlTableDef).TABLE_NAME
  const def = {
    table: table,
    hasAutoIds: null,
    columns: [],
    primary: null
  }
  _.each(sqlTableDef, (columnDef) => {
    const jsField = _.camelCase(sane(columnDef.COLUMN_NAME))
    const sqlField = sane(columnDef.COLUMN_NAME)
    const sqlDataType = sane(columnDef.DATA_TYPE)
    const jsDataType = _convertSqlToJSDataType(sqlDataType)
    const comments = []
    if (columnDef.COLUMN_COMMENT) {
      comments.push(columnDef.COLUMN_COMMENT)
    }
    comments.push(`'${sqlField}' Column on ${table}`)
    const column = {
      isPrimary: columnDef.COLUMN_NAME === 'id',
      isSystem: columnDef.COLUMN_NAME === 'last_updated',
      isOptional: !columnDef.COLUMN_DEFAULT,
      jsDataType: jsDataType,
      jsField,
      sqlField,
      comment: comments.join(', ')
    }
    def.columns.push(column)

    if (column.isPrimary) {
      def.hasAutoIds = _.includes(columnDef.EXTRA, 'auto_increment')
    }
  })
  def.primary = _.cloneDeep(_.find(def.columns, (column) => column.isPrimary))
  return def
}

/**
 * @param {Object} jsTableDef
 * @returns {string}
 */
function createTableVOJsDoc (jsTableDef) {
  const table = jsTableDef.table
  const columns = _.map(jsTableDef.columns, (column) => ` * @property {${column.jsDataType}} ${column.jsField} - ${column.comment}`)
  return `/**
 * Database Value Object for table '${sane(table)}'
 * @typedef {Object} ${_.camelCase(sane(table)) + 'VO'}
${columns.join('\n')}
 */`
}

/**
 * columns for insert operations (for insert with non managed key need to insert id as well)
 * @param {Object} jsTableDef
 * @returns {string}
 */
function getInsertColumns (jsTableDef) {
  const columns = _.filter(jsTableDef.columns, (column) => (!column.isPrimary || !jsTableDef.hasAutoIds) && !column.isSystem)
  return columns
}

/**
 * @param {Object} jsTableDef
 * @returns {string}
 */
function getUpdateColumns (jsTableDef) {
  return _.filter(jsTableDef.columns, (column) => !column.isPrimary && !column.isSystem)
}

/**
 * create queries that join table with 2nd table with results
 * @param {String} database
 * @param {String} table aka codebranch
 * @param {String} joinColumn column in table with id to join joinTable by aka scan_id
 * @param {String} joinTable aka scan
 * @param {String} postFix snake case post fix aka "with_scans"
 * @return {Object}
 * @private
 */
async function createTableJoinQueriesAndTypeDef (database, table, joinColumn, joinTable, postFix) {
  const sqlColumnsDef = await readTableColumnsDef(database, table)
  const sqlJoinColumnsDef = await readTableColumnsDef(database, joinTable)
  return _createTableJoinQueriesAndTypeDef(database, joinColumn, sqlColumnsDef, sqlJoinColumnsDef, postFix)
}

/**
 * @param {Object} jsTableDef
 * @param {Object} sqlJoinColumnsDef
 * @param {String} postFix snake case post fix aka "with_scans"
 * @returns {string}
 */
function createTableJoinVOJsDoc (jsTableDef, sqlJoinColumnsDef, postFix) {
  const table = jsTableDef.table
  const joinTable = sqlJoinColumnsDef.table
  const columns = _.map(jsTableDef.columns, (column) => ` * @property {${column.jsDataType}} ${column.jsField} - ${column.comment}`)
  const joinColumns = _.map(getUpdateColumns(sqlJoinColumnsDef), (column) => ` * @property {${column.jsDataType}} ${column.jsField} - ${column.comment}`)
  return `/**
 * Database Value Object for table join of '${sane(table)}' to '${sane(joinTable)}'
 * @typedef {Object} ${_.camelCase(sane(table + postFix)) + 'VO'}
${columns.join('\n')}
${joinColumns.join('\n')}
 */`
}

/**
 * @param {String} database
 * @param {String} joinColumn
 * @param {Object[]} sqlColumnsDef
 * @param {Object[]} sqlJoinColumnsDef
 * @param {String} postFix snake case post fix aka "with_scans"
 * @return {Object}
 * @private
 */
function _createTableJoinQueriesAndTypeDef (database, joinColumn, sqlColumnsDef, sqlJoinColumnsDef, postFix) {
  const jsTableDef = createJSTableDef(sqlColumnsDef)
  const jsJoinTableDef = createJSTableDef(sqlJoinColumnsDef)
  const table = jsTableDef.table
  const singleJoinedReadFunctionName = _.camelCase('read_' + table + '_by_id_' + postFix)
  const paginatedJoinedReadFunctionName = _.camelCase('read_' + table + 's' + postFix)
  const paginatedJoinedReadByFunctionName = _.camelCase('read_' + table + 's_by_column' + postFix)
  const columns = _.map(sqlColumnsDef, (value) => sane(value.COLUMN_NAME))
  const joinColumns = _.map(getUpdateColumns(jsJoinTableDef), (value) => sane(value.sqlField))
  const combinedSqlColumns = _.map(columns, (value) => `\\\`${jsTableDef.table}\\\`.${value} as ${_.camelCase(value)}`)
    .concat(_.map(joinColumns, (value) => `\\\`${jsJoinTableDef.table}\\\`.${value} as ${_.camelCase(value)}`))
    .join(',')

  return {
    query: `${createTableJoinVOJsDoc(jsTableDef, jsJoinTableDef, postFix)}

/**
 * @param {string} id
 * @returns {{query: string, values: Array}} prepared statement query and values for it
 */
function ${sane(singleJoinedReadFunctionName)} (id) {
    return {
        query: \`SELECT ${combinedSqlColumns} FROM \\\`${sane(jsTableDef.table)}\\\`
LEFT JOIN \\\`${sane(jsJoinTableDef.table)}\\\`
ON \\\`${sane(jsTableDef.table)}\\\`.${sane(joinColumn)} = \\\`${sane(jsJoinTableDef.table)}\\\`.id
WHERE \\\`${sane(jsTableDef.table)}\\\`.id = ?\`,
        values: [id]
    }
}
exports.${sane(singleJoinedReadFunctionName)} = ${sane(singleJoinedReadFunctionName)}

/**
 * @param {Object.<string, string>[]} [orderColumns] array key-value of columns to order and how by aka [{"id":"ASC"}, {"time":"DESC"}]
 * @param {number} [rowCount]
 * @param {number} [offset]
 * @returns {{query: string, values: Array}} prepared statement query and values for it
 */
function ${sane(paginatedJoinedReadFunctionName)} (orderColumns=null, rowCount=100, offset=0) {
    orderColumns = orderColumns || [{'id': 'ASC'}]
    let orderColumnsKV = _.map(orderColumns, (columnDef) => _.first(_.map(columnDef, (value, key) => ({ key, value }))))
    return {
        query: \`SELECT ${combinedSqlColumns} FROM \\\`${sane(table)}\\\`
LEFT JOIN \\\`${sane(jsJoinTableDef.table)}\\\`
ON \\\`${sane(jsTableDef.table)}\\\`.${sane(joinColumn)} = \\\`${sane(jsJoinTableDef.table)}\\\`.id
ORDER BY \${_.map(orderColumnsKV, (o) => sane(o.key) + ' ' + sane(o.value)).join(', ')} LIMIT ? OFFSET ?\`,
        values: [rowCount, offset]
    }
}
exports.${sane(paginatedJoinedReadFunctionName)} = ${sane(paginatedJoinedReadFunctionName)}

/**
 * @param {Object.<string, string>} columnValues key-value of columns to select by aka {"tool_scan":123}
 * @param {Object.<string, string>[]} [orderColumns] array key-value of columns to order and how by aka [{"id":"ASC"}, {"time":"DESC"}]
 * @param {number} [rowCount]
 * @param {number} [offset]
 * @returns {{query: string, values: Array}} prepared statement query and values for it
 */
function ${sane(paginatedJoinedReadByFunctionName)} (columnValues, orderColumns=null, rowCount=100, offset=0) {
    if(!_.values(columnValues).length) {
        throw new Error('No columns given to ByColumn function')
    }
    orderColumns = orderColumns || [{'id': 'ASC'}]
    let orderColumnsKV = _.map(orderColumns, (columnDef) => _.first(_.map(columnDef, (value, key) => ({ key, value }))))

    let table = "\`${sane(jsTableDef.table)}\`"
    return {
        query: \`SELECT ${combinedSqlColumns} FROM \\\`${sane(table)}\\\`
LEFT JOIN \\\`${sane(jsJoinTableDef.table)}\\\`
ON \\\`${sane(jsTableDef.table)}\\\`.${sane(joinColumn)} = \\\`${sane(jsJoinTableDef.table)}\\\`.id
WHERE \${_.map(columnValues, (value, column) => table + '.' + sane(column) + ' = ?').join(' AND ')}
ORDER BY \${_.map(orderColumnsKV, (o) => sane(o.key) + ' ' + sane(o.value)).join(', ')} LIMIT ? OFFSET ?\`,
        values: _.map(columnValues, (value) => value).concat([ rowCount, offset])
    }
}
exports.${sane(paginatedJoinedReadByFunctionName)} = ${sane(paginatedJoinedReadByFunctionName)}
`
  }
}

/**
 * @param {String} database
 * @param {String} table
 * @return {Object}
 * @private
 */
async function createTableQueriesAndTypeDef (database, table) {
  const sqlColumnsDef = await readTableColumnsDef(database, table)
  return _createTableQueriesAndTypeDef(database, table, sqlColumnsDef)
}

/**
 * @param {Object} jsTableDef
 * @return {String}
 */
function _createInsertSQLJS (jsTableDef) {
  const table = jsTableDef.table
  const jsVOClass = _.camelCase(sane(table)) + 'VO'
  const createFunctionName = _.camelCase('create_' + table)
  const ignoreDuplicatesCauseForNonAutoKeys = !jsTableDef.hasAutoIds
    ? ' ON DUPLICATE KEY UPDATE id=id'
    : ''
  return `/**
${jsTableDef.hasAutoIds
    ? ` * insert new unkeyed rows into ${jsTableDef.table} (no id field required, auto generated by db)`
    : ` * insert new keyed rows into ${jsTableDef.table} (id field required, operation will fail without id, duplicate id inserts will be ignored)`
}
 * @param {${jsVOClass}[]} vos
 * @returns {{query: string, values: Array}} prepared statement query and values for it
 */
function ${sane(createFunctionName)} (vos) {
    let values = _.map(vos, (vo) => _.map([${_.map(getInsertColumns(jsTableDef), (column) => JSON.stringify(column.jsField)).join(', ')}], (columnName) => vo[columnName]))
    return {
        query: \`INSERT INTO \\\`${sane(table)}\\\` (${_.map(getInsertColumns(jsTableDef), (column) => column.sqlField).join(', ')}) VALUES ?${ignoreDuplicatesCauseForNonAutoKeys}\`,
        values: [values]
    }
}
exports.${sane(createFunctionName)} = ${sane(createFunctionName)}`
}

/**
 * @param {String} database
 * @param {String} table
 * @param {Object[]} sqlColumnsDef
 * @return {Object}
 * @private
 */
function _createTableQueriesAndTypeDef (database, table, sqlColumnsDef) {
  const singleReadFunctionName = _.camelCase('read_' + table + '_by_id')
  const paginatedReadFunctionName = _.camelCase('read_' + table + 's')
  const paginatedReadByFunctionName = _.camelCase('read_' + table + 's_by_column')
  const updateFunctionName = _.camelCase('update_' + table)
  const deleteFunctionName = _.camelCase('delete_' + table)
  const columns = _.map(sqlColumnsDef, (value) => sane(value.COLUMN_NAME))
  const sqlColumns = _.map(columns, (value) => `${value} as ${_.camelCase(value)}`).join(',')

  const jsTableDef = createJSTableDef(sqlColumnsDef)

  const jsVOClass = _.camelCase(sane(table)) + 'VO'
  const jsVOClassDef = sane(table).toUpperCase() + '_DEF'

  // console.log(`\n\nSQL COLUMNS FOR ${database}.${table}`)
  // console.log(JSON.stringify(sqlColumnsDef, null, '  '))

  return {
    query: `${createTableVOJsDoc(jsTableDef)}
const ${jsVOClassDef} = ${JSON.stringify(jsTableDef, null, '  ')}
exports.${jsVOClassDef} = ${jsVOClassDef}

${_createInsertSQLJS(jsTableDef)}

/**
 * @param {${jsVOClass}} vo partially populated, requires '${jsTableDef.primary.jsField}' field populated
 * @returns {{query: string, values: Array}} prepared statement query and values for it
 */
function ${sane(updateFunctionName)} (vo) {
    let updatableColumns = ${JSON.stringify(_.map(getUpdateColumns(jsTableDef), (column) => { return { jsField: column.jsField, sqlField: column.sqlField } }))}
    let columnsToUpdate = _.filter(updatableColumns, (c) => c.jsField in vo)
    let values = _.map(columnsToUpdate, (c) => vo[c.jsField])
    values.push(vo.${sane(jsTableDef.primary.jsField)})
    return {
        query: \`UPDATE \\\`${sane(table)}\\\` SET \${_.map(columnsToUpdate, (c) => c.sqlField + ' = ?').join(', ')} WHERE ${jsTableDef.primary.sqlField} = ?\`,
        values: values
    }
}
exports.${sane(updateFunctionName)} = ${sane(updateFunctionName)}

/**
 * @param {${jsVOClass}} vo partially populated, requires '${jsTableDef.primary.jsField}' field populated
 * @returns {{query: string, values: Array}} prepared statement query and values for it
 */
function ${sane(deleteFunctionName)} (vo) {
    return {
        query: \`DELETE FROM \\\`${sane(table)}\\\` WHERE ${jsTableDef.primary.sqlField} = ?\`,
        values: [vo.${sane(jsTableDef.primary.jsField)}]
    }
}
exports.${sane(deleteFunctionName)} = ${sane(deleteFunctionName)}

/**
 * @param {string} id
 * @returns {{query: string, values: Array}} prepared statement query and values for it
 */
function ${sane(singleReadFunctionName)} (id) {
    return {
        query: \`SELECT ${sqlColumns} FROM \\\`${sane(table)}\\\` WHERE id = ?\`,
        values: [id]
    }
}
exports.${sane(singleReadFunctionName)} = ${sane(singleReadFunctionName)}

/**
 * @param {Object.<string, string>[]} [orderColumns] array key-value of columns to order and how by aka [{"id":"ASC"}, {"time":"DESC"}]
 * @param {number} [rowCount]
 * @param {number} [offset]
 * @returns {{query: string, values: Array}} prepared statement query and values for it
 */
function ${sane(paginatedReadFunctionName)} (orderColumns=null, rowCount=100, offset=0) {
    orderColumns = orderColumns || [{'id': 'ASC'}]
    let orderColumnsKV = _.map(orderColumns, (columnDef) => _.first(_.map(columnDef, (value, key) => ({ key, value }))))
    return {
        query: \`SELECT ${sqlColumns} FROM \\\`${sane(table)}\\\`
ORDER BY \${_.map(orderColumnsKV, (o) => sane(o.key) + ' ' + sane(o.value)).join(', ')} LIMIT ? OFFSET ?\`,
        values: [rowCount, offset]
    }
}
exports.${sane(paginatedReadFunctionName)} = ${sane(paginatedReadFunctionName)}

/**
 * @param {Object.<string, string>} columnValues key-value of columns to select by aka {"tool_scan":123}
 * @param {Object.<string, string>[]} [orderColumns] array key-value of columns to order and how by aka [{"id":"ASC"}, {"time":"DESC"}]
 * @param {number} [rowCount]
 * @param {number} [offset]
 * @returns {{query: string, values: Array}} prepared statement query and values for it
 */
function ${sane(paginatedReadByFunctionName)} (columnValues, orderColumns=null, rowCount=100, offset=0) {
    if(!_.values(columnValues).length) {
        throw new Error('No columns given to ByColumn function')
    }
    orderColumns = orderColumns || [{'id': 'ASC'}]
    let orderColumnsKV = _.map(orderColumns, (columnDef) => _.first(_.map(columnDef, (value, key) => ({ key, value }))))
    return {
        query: \`SELECT ${sqlColumns} FROM \\\`${sane(table)}\\\`
WHERE \${_.map(columnValues, (value, column) => sane(column) + ' = ?').join(' AND ')}
ORDER BY \${_.map(orderColumnsKV, (o) => sane(o.key) + ' ' + sane(o.value)).join(', ')} LIMIT ? OFFSET ?\`,
        values: _.map(columnValues, (value) => value).concat([rowCount, offset])
    }
}
exports.${sane(paginatedReadByFunctionName)} = ${sane(paginatedReadByFunctionName)}
`
  }
}

module.exports = {
  sane,
  createConnection,
  orderColumnsToKV,
  callQuery,
  killConnection,
  readTableDef: readTableColumnsDef,
  createJSTableDef,
  readTablesDef,
  createTableQueriesAndTypeDef,
  createTableJoinQueriesAndTypeDef,
  stringSaneFunction,
  createTableVOJsDoc,
  getInsertColumns,
  getUpdateColumns,
  _createTableQueriesAndTypeDef,
  _createTableJoinQueriesAndTypeDef,
  _createInsertSQLJS
}
