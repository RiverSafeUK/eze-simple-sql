# eze-simple-sql
A simple tool for generating orm js 'sql' access call functions from rds database instance

Also generates jsdoc for the resultant VOs

# Howto Run

```bash
eze-simple-sql --rds -r eu-west-2 -h xxx.xxx.eu-west-2.rds.amazonaws.com -p 3306 -d test -u admin -c 'db-join-queries.json' -o 'db-simple-queries.js'
```

Will generate simple javascript that only requires lodash and mysql libraries to perform orm style queries.

These can be copy and paste individually, or a package to produce minimalistic javascript.

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