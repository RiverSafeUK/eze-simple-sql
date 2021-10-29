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

# Advanced Usage

## Custom Joins
For interesting fast table joins

you can add "-c xxx.json" (example in examples/ folder)

this will create "left join" queries on the "id" of the joint table

* tip: it's a good idea to make sure these join columns have foreign keys for consistency, but that's your call

aka

where tables shirts and colours exist

```mysql
CREATE TABLE IF NOT EXISTS `colours` (
    `id` INT(10) NOT NULL AUTO_INCREMENT COMMENT 'Primary ID',
    `colour_name` VARCHAR(256) NULL DEFAULT NULL,
    `last_updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`) USING BTREE
);

CREATE TABLE IF NOT EXISTS `shirts` (
    `id` INT(10) NOT NULL AUTO_INCREMENT COMMENT 'Primary ID',
    `shirt_name` VARCHAR(256) NULL DEFAULT NULL,
    `colour_id` INT(10) NULL DEFAULT NULL,
    `last_updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`) USING BTREE,
    INDEX `shirts__colour_id` (`colour_id`) USING BTREE,
    CONSTRAINT `shirts__colour_id` FOREIGN KEY (`colour_id`) REFERENCES `colours` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
```

You could create queries to join the tables colours and shirts together, using this json to produce the output below

```json
[
{
"table": "shirts",
"joinColumn": "colour_id",
"joinTable": "colours",
"postFix": "_with_colour"
}
]
```

```js
/**
 * Database Value Object for table join of 'shirts' to 'colours'
 * @typedef {Object} shirtWithColourVO
 * @property {number} id - Primary ID, 'id' Column on shirts
 * @property {string} shirtName - 'shirt_name' Column on shirts
 * @property {number} colourId - 'colour_id' Column on shirts
 * @property {string} colourName - 'colour_name' Column on colours
 */

// select with no where
function readShirtsWithColour (orderColumns=null, rowCount=100, offset=0)...
// select with where
function readShirtsByColumnWithColour (columnValues, orderColumns=null, rowCount=100, offset=0)...
```