const start = Date.now();

const {stream} = require('./index');

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