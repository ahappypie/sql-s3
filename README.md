# sql-s3
Streams arbitrary SQL objects (tables or views) to S3 as delimited files.

## Installation
First add the library:
```bash
npm install sql-s3 --save

yarn add sql-s3
```
Then add your database driver:
```bash
npm install pg pg-query-stream
npm install sqlite3
npm install mysql
npm install mysql2
npm install oracle
npm install mssql
```

## Usage
Here is an example using environment variables to configure the available options:
```javascript
const start = Date.now();

const { stream } = require('./index');

const main = async () => {
    try {
        const s = await stream({
            SQL_DIALECT: process.env.SQL_DIALECT, SQL_USER: process.env.SQL_USER, SQL_PASSWORD: process.env.SQL_PASSWORD,
            SQL_HOST: process.env.SQL_HOST, SQL_DATABASE: process.env.SQL_DATABASE, DEBUG: process.env.DEBUG,
            AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY, AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
            AWS_REGION: process.env.AWS_REGION, SQL_TABLE: process.env.SQL_TABLE, SQL_SCHEMA: process.env.SQL_SCHEMA,
            COMPRESS: process.env.COMPRESS, BUCKET: process.env.BUCKET, KEY_PREFIX: process.env.KEY_PREFIX
        });
        console.log(s);
    } catch(ex) {
        console.error(ex);
    } finally {
        console.log(`Finished ${process.env.SQL_DATABASE}.${process.env.SQL_SCHEMA}.${process.env.SQL_TABLE} in ${Date.now() - start} ms`);
        process.exit(0);
    }
};
main();
```
A few notes:
* `KEY_PREFIX` can be used to override the database name in the S3 object name. Otherwise the file will be called `${SQL_DATABASE}/${SQL_SCHEMA}/${opts.SQL_TABLE}.csv`
* `DEBUG` option will log raw queries, row counts and byte flow to stdout
* `COMPRESS` option will pass the stream through a Node.js Gzip stream, compressing the results
* `DROP_COLUMNS` variable can be used to specify columns to drop (otherwise returns `SELECT *`). Use a comma-separated list to specify multiple columns.