#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { loadJSON } = require('./src/lib/io-helpers')
const { run } = require('./src/build_queries')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv


// custom join queries
const output = argv.output || argv.o
const customJoins = argv.customJoins ? loadJSON(argv.customJoins) : []

const dbConfig = {
  isRDS: !!argv.rds || process.env.DB_RDS,
  region: argv.region || argv.r || process.env.DB_REGION,
  host: argv.host || argv.h || process.env.DB_HOSTNAME,
  port: argv.port || argv.p || process.env.DB_PORT,
  username: argv.username || argv.u || process.env.DB_USER,
  database: argv.database || argv.d || process.env.DB_DATABASE,
  password: argv.password || process.env.DB_PASSWORD
}

console.log('CONNECTING TO DB')
createConnection(dbConfig).then(() => {
  console.log('STARTING, build build')
  run(output, customJoins).then(() => {
    console.log('FINISHED, yes yes, built the sql I have...')
  })
})

