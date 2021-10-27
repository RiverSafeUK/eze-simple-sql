const {
  getInsertColumns,
  createTableVOJsDoc,
  createJSTableDef,
  getUpdateColumns,
  _createTableJoinQueriesAndTypeDef,
  _createTableQueriesAndTypeDef,
  _createInsertSQLJS
} = require('./sql-helpers')
const _ = require('lodash')
const { orderColumnsToKV } = require('./sql-helpers')
const testTableDef = [
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'codebase',
    COLUMN_NAME: 'id',
    ORDINAL_POSITION: 1,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: 'PRI',
    EXTRA: 'auto_increment',
    PRIVILEGES: 'select',
    COLUMN_COMMENT: 'Primary ID',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'codebase',
    COLUMN_NAME: 'group_id',
    ORDINAL_POSITION: 2,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'YES',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: 'MUL',
    EXTRA: '',
    PRIVILEGES: 'select',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'codebase',
    COLUMN_NAME: 'name',
    ORDINAL_POSITION: 3,
    COLUMN_DEFAULT: '',
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'varchar',
    CHARACTER_MAXIMUM_LENGTH: 128,
    CHARACTER_OCTET_LENGTH: 512,
    NUMERIC_PRECISION: null,
    NUMERIC_SCALE: null,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: 'utf8mb4',
    COLLATION_NAME: 'utf8mb4_0900_ai_ci',
    COLUMN_TYPE: 'varchar(128)',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'codebase',
    COLUMN_NAME: 'description',
    ORDINAL_POSITION: 4,
    COLUMN_DEFAULT: '',
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'varchar',
    CHARACTER_MAXIMUM_LENGTH: 512,
    CHARACTER_OCTET_LENGTH: 2048,
    NUMERIC_PRECISION: null,
    NUMERIC_SCALE: null,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: 'utf8mb4',
    COLLATION_NAME: 'utf8mb4_0900_ai_ci',
    COLUMN_TYPE: 'varchar(512)',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'codebase',
    COLUMN_NAME: 'repo_url',
    ORDINAL_POSITION: 5,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'YES',
    DATA_TYPE: 'varchar',
    CHARACTER_MAXIMUM_LENGTH: 256,
    CHARACTER_OCTET_LENGTH: 1024,
    NUMERIC_PRECISION: null,
    NUMERIC_SCALE: null,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: 'utf8mb4',
    COLLATION_NAME: 'utf8mb4_0900_ai_ci',
    COLUMN_TYPE: 'varchar(256)',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'codebase',
    COLUMN_NAME: 'last_updated',
    ORDINAL_POSITION: 6,
    COLUMN_DEFAULT: 'CURRENT_TIMESTAMP',
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'timestamp',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: null,
    NUMERIC_SCALE: null,
    DATETIME_PRECISION: 0,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'timestamp',
    COLUMN_KEY: '',
    EXTRA: 'DEFAULT_GENERATED on update CURRENT_TIMESTAMP',
    PRIVILEGES: 'select',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  }
]

// FROM SQL COLUMNS FOR test.vulnerability
const testTableDefWithoutAutoId = [
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'vulnerability',
    COLUMN_NAME: 'id',
    ORDINAL_POSITION: 1,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'varchar',
    CHARACTER_MAXIMUM_LENGTH: 40,
    CHARACTER_OCTET_LENGTH: 160,
    NUMERIC_PRECISION: null,
    NUMERIC_SCALE: null,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: 'utf8mb4',
    COLLATION_NAME: 'utf8mb4_0900_ai_ci',
    COLUMN_TYPE: 'varchar(40)',
    COLUMN_KEY: 'PRI',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: 'Primary ID, sha-1 hash of all field, git style',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'vulnerability',
    COLUMN_NAME: 'type_id',
    ORDINAL_POSITION: 3,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: 'MUL',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'vulnerability',
    COLUMN_NAME: 'name',
    ORDINAL_POSITION: 4,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'YES',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'vulnerability',
    COLUMN_NAME: 'last_updated',
    ORDINAL_POSITION: 11,
    COLUMN_DEFAULT: 'CURRENT_TIMESTAMP',
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'timestamp',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: null,
    NUMERIC_SCALE: null,
    DATETIME_PRECISION: 0,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'timestamp',
    COLUMN_KEY: '',
    EXTRA: 'DEFAULT_GENERATED on update CURRENT_TIMESTAMP',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  }
]

describe('createJSTableDef', () => {
  test('std', () => {
    const expectedOutput = {
      columns: [
        {
          comment: "Primary ID, 'id' Column on codebase",
          isOptional: true,
          isPrimary: true,
          isSystem: false,
          jsDataType: 'number',
          jsField: 'id',
          sqlField: 'id'
        },
        {
          comment: "'group_id' Column on codebase",
          isOptional: true,
          isPrimary: false,
          isSystem: false,
          jsDataType: 'number',
          jsField: 'groupId',
          sqlField: 'group_id'
        },
        {
          comment: "'name' Column on codebase",
          isOptional: true,
          isPrimary: false,
          isSystem: false,
          jsDataType: 'string',
          jsField: 'name',
          sqlField: 'name'
        },
        {
          comment: "'description' Column on codebase",
          isOptional: true,
          isPrimary: false,
          isSystem: false,
          jsDataType: 'string',
          jsField: 'description',
          sqlField: 'description'
        },
        {
          comment: "'repo_url' Column on codebase",
          isOptional: true,
          isPrimary: false,
          isSystem: false,
          jsDataType: 'string',
          jsField: 'repoUrl',
          sqlField: 'repo_url'
        },
        {
          comment: "'last_updated' Column on codebase",
          isOptional: false,
          isPrimary: false,
          isSystem: true,
          jsDataType: 'string',
          jsField: 'lastUpdated',
          sqlField: 'last_updated'
        }
      ],
      hasAutoIds: true,
      primary: {
        comment: "Primary ID, 'id' Column on codebase",
        isOptional: true,
        isPrimary: true,
        isSystem: false,
        jsDataType: 'number',
        jsField: 'id',
        sqlField: 'id'
      },
      table: 'codebase'
    }
    const output = createJSTableDef(testTableDef)
    expect(output).toEqual(expectedOutput)
    expect(output.hasAutoIds).toEqual(true)
  })

  test('std: with non auto incremented id', () => {
    const expectedOutput = {
      columns: [
        {
          comment: "Primary ID, sha-1 hash of all field, git style, 'id' Column on vulnerability",
          isOptional: true,
          isPrimary: true,
          isSystem: false,
          jsDataType: 'string',
          jsField: 'id',
          sqlField: 'id'
        },
        {
          comment: "'type_id' Column on vulnerability",
          isOptional: true,
          isPrimary: false,
          isSystem: false,
          jsDataType: 'number',
          jsField: 'typeId',
          sqlField: 'type_id'
        },
        {
          comment: "'name' Column on vulnerability",
          isOptional: true,
          isPrimary: false,
          isSystem: false,
          jsDataType: 'number',
          jsField: 'name',
          sqlField: 'name'
        },
        {
          comment: "'last_updated' Column on vulnerability",
          isOptional: false,
          isPrimary: false,
          isSystem: true,
          jsDataType: 'string',
          jsField: 'lastUpdated',
          sqlField: 'last_updated'
        }
      ],
      hasAutoIds: false,
      primary: {
        comment: "Primary ID, sha-1 hash of all field, git style, 'id' Column on vulnerability",
        isOptional: true,
        isPrimary: true,
        isSystem: false,
        jsDataType: 'string',
        jsField: 'id',
        sqlField: 'id'
      },
      table: 'vulnerability'
    }
    const output = createJSTableDef(testTableDefWithoutAutoId)
    expect(output).toEqual(expectedOutput)
    expect(output.hasAutoIds).toEqual(false)
  })
})

describe('createTableVOJsDoc', () => {
  test('std', () => {
    const expectedOutput = `/**
 * Database Value Object for table 'codebase'
 * @typedef {Object} codebaseVO
 * @property {number} id - Primary ID, 'id' Column on codebase
 * @property {number} groupId - 'group_id' Column on codebase
 * @property {string} name - 'name' Column on codebase
 * @property {string} description - 'description' Column on codebase
 * @property {string} repoUrl - 'repo_url' Column on codebase
 * @property {string} lastUpdated - 'last_updated' Column on codebase
 */`
    const inputTableDef = createJSTableDef(testTableDef)
    const output = createTableVOJsDoc(inputTableDef)
    expect(output).toEqual(expectedOutput)
  })
})

describe('getInsertColumns', () => {
  test('std: with auto id', () => {
    const expectedOutput = ['groupId', 'name', 'description', 'repoUrl']
    const inputTableDef = createJSTableDef(testTableDef)
    const output = getInsertColumns(inputTableDef)
    expect(_.map(output, (column) => column.jsField)).toEqual(expectedOutput)
  })
  test('std: without auto id', () => {
    // Has ID
    const expectedOutput = ['id', 'typeId', 'name']
    const inputTableDef = createJSTableDef(testTableDefWithoutAutoId)
    const output = getInsertColumns(inputTableDef)
    expect(_.map(output, (column) => column.jsField)).toEqual(expectedOutput)
  })
})
describe('getUpdateColumns', () => {
  test('std: with auto id', () => {
    const expectedOutput = ['groupId', 'name', 'description', 'repoUrl']
    const inputTableDef = createJSTableDef(testTableDef)
    const output = getUpdateColumns(inputTableDef)
    expect(_.map(output, (column) => column.jsField)).toEqual(expectedOutput)
  })
  test('std: without auto id', () => {
    // Has not ID
    const expectedOutput = ['typeId', 'name']
    const inputTableDef = createJSTableDef(testTableDefWithoutAutoId)
    const output = getUpdateColumns(inputTableDef)
    expect(_.map(output, (column) => column.jsField)).toEqual(expectedOutput)
  })
})
describe('_createInsertSQLJS', () => {
  test('std: with auto id', () => {
    const inputTableDef = createJSTableDef(testTableDef)
    const output = _createInsertSQLJS(inputTableDef)
    expect(output).toMatchSnapshot()
  })
  test('std: without auto id', () => {
    const inputTableDef = createJSTableDef(testTableDefWithoutAutoId)
    const output = _createInsertSQLJS(inputTableDef)
    expect(output).toMatchSnapshot()
  })
})

describe('_createTableQueriesAndTypeDef', () => {
  test('std', () => {
    const output = _createTableQueriesAndTypeDef('test', 'codebase', testTableDef)
    expect(output.query).toMatchSnapshot()
  })
})

// RUNNING QUERY = SELECT * FROM `information_schema`.`COLUMNS` WHERE TABLE_SCHEMA='test' AND TABLE_NAME='codebase' ORDER BY ORDINAL_POSITION;
// SQL COLUMNS FOR test.codebase
const codebaseColumns = [
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'codebase',
    COLUMN_NAME: 'id',
    ORDINAL_POSITION: 1,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: 'PRI',
    EXTRA: 'auto_increment',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: 'Primary ID',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'codebase',
    COLUMN_NAME: 'group_id',
    ORDINAL_POSITION: 2,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'YES',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: 'MUL',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'codebase',
    COLUMN_NAME: 'latest_scan_id',
    ORDINAL_POSITION: 3,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'YES',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: 'Scan ID for the main branch latest scan',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'codebase',
    COLUMN_NAME: 'name',
    ORDINAL_POSITION: 4,
    COLUMN_DEFAULT: '',
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'varchar',
    CHARACTER_MAXIMUM_LENGTH: 128,
    CHARACTER_OCTET_LENGTH: 512,
    NUMERIC_PRECISION: null,
    NUMERIC_SCALE: null,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: 'utf8mb4',
    COLLATION_NAME: 'utf8mb4_0900_ai_ci',
    COLUMN_TYPE: 'varchar(128)',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'codebase',
    COLUMN_NAME: 'description',
    ORDINAL_POSITION: 5,
    COLUMN_DEFAULT: '',
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'varchar',
    CHARACTER_MAXIMUM_LENGTH: 512,
    CHARACTER_OCTET_LENGTH: 2048,
    NUMERIC_PRECISION: null,
    NUMERIC_SCALE: null,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: 'utf8mb4',
    COLLATION_NAME: 'utf8mb4_0900_ai_ci',
    COLUMN_TYPE: 'varchar(512)',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'codebase',
    COLUMN_NAME: 'repo_url',
    ORDINAL_POSITION: 6,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'YES',
    DATA_TYPE: 'varchar',
    CHARACTER_MAXIMUM_LENGTH: 256,
    CHARACTER_OCTET_LENGTH: 1024,
    NUMERIC_PRECISION: null,
    NUMERIC_SCALE: null,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: 'utf8mb4',
    COLLATION_NAME: 'utf8mb4_0900_ai_ci',
    COLUMN_TYPE: 'varchar(256)',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'codebase',
    COLUMN_NAME: 'last_updated',
    ORDINAL_POSITION: 7,
    COLUMN_DEFAULT: 'CURRENT_TIMESTAMP',
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'timestamp',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: null,
    NUMERIC_SCALE: null,
    DATETIME_PRECISION: 0,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'timestamp',
    COLUMN_KEY: '',
    EXTRA: 'DEFAULT_GENERATED on update CURRENT_TIMESTAMP',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  }
]
// RUNNING QUERY = SELECT * FROM `information_schema`.`COLUMNS` WHERE TABLE_SCHEMA='test' AND TABLE_NAME='scan' ORDER BY ORDINAL_POSITION;
// SQL COLUMNS FOR test.scan
const scanColumns = [
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'id',
    ORDINAL_POSITION: 1,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: 'PRI',
    EXTRA: 'auto_increment',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: 'Primary ID',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'codebasebranch_id',
    ORDINAL_POSITION: 2,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'YES',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: 'MUL',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'date',
    ORDINAL_POSITION: 3,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'timestamp',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: null,
    NUMERIC_SCALE: null,
    DATETIME_PRECISION: 0,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'timestamp',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: 'scan date',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'duration',
    ORDINAL_POSITION: 4,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: 'scan duration',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'report_s3_key',
    ORDINAL_POSITION: 5,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'YES',
    DATA_TYPE: 'varchar',
    CHARACTER_MAXIMUM_LENGTH: 256,
    CHARACTER_OCTET_LENGTH: 1024,
    NUMERIC_PRECISION: null,
    NUMERIC_SCALE: null,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: 'utf8mb4',
    COLLATION_NAME: 'utf8mb4_0900_ai_ci',
    COLUMN_TYPE: 'varchar(256)',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'status',
    ORDINAL_POSITION: 6,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'YES',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: 'MUL',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'sca_state',
    ORDINAL_POSITION: 7,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'YES',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: 'MUL',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'sast_state',
    ORDINAL_POSITION: 8,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'YES',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: 'MUL',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'secrets_state',
    ORDINAL_POSITION: 9,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'YES',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: 'MUL',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'sbom_state',
    ORDINAL_POSITION: 10,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'YES',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: 'MUL',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'critical',
    ORDINAL_POSITION: 11,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'high',
    ORDINAL_POSITION: 12,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'medium',
    ORDINAL_POSITION: 13,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'na',
    ORDINAL_POSITION: 14,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'none',
    ORDINAL_POSITION: 15,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'total',
    ORDINAL_POSITION: 16,
    COLUMN_DEFAULT: null,
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'int',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: 10,
    NUMERIC_SCALE: 0,
    DATETIME_PRECISION: null,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'int',
    COLUMN_KEY: '',
    EXTRA: '',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  },
  {
    TABLE_CATALOG: 'def',
    TABLE_SCHEMA: 'test',
    TABLE_NAME: 'scan',
    COLUMN_NAME: 'last_updated',
    ORDINAL_POSITION: 17,
    COLUMN_DEFAULT: 'CURRENT_TIMESTAMP',
    IS_NULLABLE: 'NO',
    DATA_TYPE: 'timestamp',
    CHARACTER_MAXIMUM_LENGTH: null,
    CHARACTER_OCTET_LENGTH: null,
    NUMERIC_PRECISION: null,
    NUMERIC_SCALE: null,
    DATETIME_PRECISION: 0,
    CHARACTER_SET_NAME: null,
    COLLATION_NAME: null,
    COLUMN_TYPE: 'timestamp',
    COLUMN_KEY: '',
    EXTRA: 'DEFAULT_GENERATED on update CURRENT_TIMESTAMP',
    PRIVILEGES: 'select,insert,update',
    COLUMN_COMMENT: '',
    GENERATION_EXPRESSION: '',
    SRS_ID: null
  }
]

describe('_createTableJoinQueriesAndTypeDef', () => {
  test('std', () => {
    const output = _createTableJoinQueriesAndTypeDef('test', 'latest_scan_id', codebaseColumns, scanColumns, '_with_scan')
    expect(output.query).toMatchSnapshot()
  })
})

describe('orderColumnsToKV', () => {
  [
    {
      title: 'std: id case',
      input: [{ id: 'ASC' }],
      expectedOutput: [{ key: 'id', value: 'ASC' }]
    },
    {
      title: 'std: multi column case',
      input: [{ id: 'ASC' }, { date: 'DESC' }],
      expectedOutput: [{ key: 'id', value: 'ASC' }, { key: 'date', value: 'DESC' }]
    },
    {
      title: 'std: ignore multi columns in a single def case',
      input: [{ id: 'ASC', date: 'DESC' }],
      expectedOutput: [{ key: 'id', value: 'ASC' }]
    }
  ].forEach((testData) => {
    test(testData.title, () => {
      const output = orderColumnsToKV(testData.input)
      expect(output).toEqual(testData.expectedOutput)
    })
  })
})
