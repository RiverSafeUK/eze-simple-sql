const yargs = require('yargs/yargs')
const { loadJSON } = require('./helpers/io-helpers')
const { createConnection } = require('./helpers/sql-helpers')
const { run } = require('./build_queries')
const _ = require('lodash')
const { hideBin } = require('yargs/helpers')
const rawArgv = yargs(hideBin(process.argv)).argv

function printHelp () {
  console.log(`Welcome to the super simple sql js function writer
This is for projects that want super simple and small js functions for accessing mysql tables

Flags
=========================
--help for help information
--version for version information

Main Flags
=========================
--rds for stating is aws rds database and hence requires aws certs
-r/--region/env.DB_REGION for stating aws region for rds databases
-h/--host/env.DB_HOSTNAME for db hostname
-p/--port/env.DB_PORT for db port
-u/--username/env.DB_USER for db username
-d/--database/env.DB_DATABASE for database name
-p/--password/env.DB_PASSWORD for database password (if rds db, and omitted will use IAM login)
-c/--customJoins optional json file containing tables to write joining functions for
`)
}

function printVersion() {
  console.log(`Version: ${require('./../package.json').version}`)
}

/**
 * @param {Object} [argv] cli arguments defaults to yargs parsed
 */
exports.main = async (argv = rawArgv) => {
  let hasDB = argv.d || argv.database
  if (argv.help || !hasDB) {
    printVersion()
    printHelp()
    return
  }
  if (argv.version) {
    printVersion()
    return
  }

  // custom join queries
  const output = argv.output || argv.o
  let customJoinsArgv = argv.customJoins || argv.c
  const customJoins = customJoinsArgv ? loadJSON(customJoinsArgv) : []

  const dbConfig = {
    isRDS: !!argv.rds || process.env.DB_RDS,
    region: argv.region || argv.r || process.env.DB_REGION,
    host: argv.host || argv.h || process.env.DB_HOSTNAME,
    port: argv.port || argv.p || process.env.DB_PORT,
    username: argv.username || argv.u || process.env.DB_USER,
    database: argv.database || argv.d || process.env.DB_DATABASE,
    password: argv.password || process.env.DB_PASSWORD
  }

  console.log(`CONNECTING TO DB: ${dbConfig.host}`)
  await createConnection(dbConfig)
  console.log('STARTING, build build')
  await run(output, customJoins, dbConfig)
  console.log('FINISHED, yes yes, built the sql I have...')
}


// allow direct execution
if (require.main === module) {
  exports.main();
}