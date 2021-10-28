# eze-simple-sql
A simple tool for generating orm js 'sql' access call functions for mysql dbs.

Reads the db tables, and creates js for accessing each table, jsdoc for the table row vo, with optional support for build simple fast "left join" queries.

# Howto Install

```bash
npm install eze-simple-sql -g
```


# Howto Run

```bash
eze-simple-sql --rds -r eu-west-2 -h xxx.xxx.eu-west-2.rds.amazonaws.com -p 3306 -d test -u admin -c 'db-join-queries.json' -o 'db-simple-queries.js'
```

Generates a lightweight javascript file that only requires lodash and mysql libraries to perform orm style queries.

These access functions are self-contained and can be copy and pasted individually, or as a complete package to produce minimalistic javascript for size sensitive environments like aws lambda functions or embedded systems.

# CLI help

```bash
Welcome to the super simple sql js function writer
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
```