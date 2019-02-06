const start = Date.now();

const SQL = require('./sql');
const S3 = require('./s3');
const gzip = require('zlib').createGzip();

const shortcuts = new SQL(process.env.SQL_DIALECT, {user: process.env.SQL_USER, password: process.env.SQL_PASSWORD, host: process.env.SQL_HOST, database: process.env.SQL_DATABASE}, process.env.DEBUG);
//const psUtility = new SQL('mssql', {user: process.env.MSSQL_USER, password: process.env.MSSQL_PASSWORD, host: process.env.MSSQL_HOST, database: 'PSUtility'});
const s3 = new S3({accessKey: process.env.AWS_ACCESS_KEY, secretKey: process.env.AWS_SECRET_KEY, region: process.env.AWS_REGION});

const main = async () => {
    try {
        const s = await shortcuts.stream({table: process.env.SQL_TABLE, schema: process.env.SQL_SCHEMA});
        //const w = require('fs').createWriteStream('./out.csv.gz');
        //s.pipe(gzip).pipe(w);
        await s3.upload(s.pipe(gzip), {bucket: process.env.BUCKET, key: `${process.env.KEY_PREFIX || process.env.SQL_DATABASE}/${process.env.SQL_SCHEMA}/${process.env.SQL_TABLE}.csv.gz`});
    } catch(ex) {
        console.error(ex);
    } finally {
        console.log(`Finished ${process.env.SQL_DATABASE}.${process.env.SQL_SCHEMA}.${process.env.SQL_TABLE} in ${Date.now() - start} ms`);
        process.exit(0);
    }
};
main();