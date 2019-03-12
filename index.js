const SQL = require('./lib/sql');
const S3 = require('./lib/s3');
const gzip = require('zlib').createGzip();

const main = async (opts) => {
    if(!opts) {
        throw new Error('Missing required parameters. Please pass an options object to this function.')
    }

    const db = new SQL(opts.SQL_DIALECT, {
            user: opts.SQL_USER,
            password: opts.SQL_PASSWORD,
            host: opts.SQL_HOST,
            database: opts.SQL_DATABASE
        },
        opts.DEBUG);

    const s3 = new S3({
        accessKey: opts.AWS_ACCESS_KEY,
        secretKey: opts.AWS_SECRET_KEY,
        region: opts.AWS_REGION
    });

    try {
        const s = await db.stream({
            table: opts.SQL_TABLE,
            schema: opts.SQL_SCHEMA,
            drop_columns: opts.DROP_COLUMNS
        });

        let sc;
        if(opts.COMPRESS) {
            sc = s.pipe(gzip);
        } else {
            sc = s;
        }

        return s3.upload(sc, {
            bucket: opts.BUCKET,
            key: `${opts.KEY_PREFIX || opts.SQL_DATABASE}/${opts.SQL_SCHEMA}/${opts.SQL_TABLE}.csv${opts.COMPRESS ? '.gz' : ''}`
        });
    } catch(ex) {
        throw new Error(ex);
    }
};

module.exports = {
    SQL: SQL,
    S3: S3,
    stream: main
};