const { Transform, PassThrough } = require('stream');
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

class SQL {
    constructor(client, config, debug) {
        this.debug = debug;
        this.knex = require('knex')({
            client: client,
            connection: {
                ...config,
                requestTimeout: 0
            },
            debug: debug,
            asyncStackTraces: debug
        });
    }

    async stream(t) {
        if(!(t.schema && t.table)) {
            throw new Error('Missing required parameters. Please pass an object with the following structure to this function:\n{\n    schema: ...,\n    table: ...\n}');
        }

        try {
            const header = await this.knex.withSchema(t.schema).from(t.table).columnInfo();
            const csv = createCsvStringifier({header: Object.keys(header), fieldDelimiter: process.env.FIELD_DELIMITER || ','});
            const toCsv = new Transform({
                objectMode: true,
                transform(chunk, encoding, callback) {
                    const dateTypes = ['datetime', 'smalldatetime'];

                    if(process.env.DROP_COLUMNS) {
                        process.env.DROP_COLUMNS.split(',').forEach(c => delete chunk[c]);
                    }

                    Object.keys(chunk).forEach(k => {
                        if(dateTypes.indexOf(header[k].type) >= 0 && chunk[k]) {
                            chunk[k] = chunk[k].toISOString();
                        }
                    });
                    callback(null, csv.stringifyRecords([chunk]))
                }
            });

            const s = this.knex.withSchema(t.schema).select('*').from(t.table).timeout(60000*3*10).stream();

            if(this.debug) {
                const typeSizes = {
                    "undefined": () => 0,
                    "boolean": () => 4,
                    "number": () => 8,
                    "string": item => 2 * item.length,
                    "object": item => !item ? 0 : Object
                        .keys(item)
                        .reduce((total, key) => sizeOf(key) + sizeOf(item[key]) + total, 0)
                };

                const sizeOf = (value) => typeSizes[typeof value](value);
                let bytes = 0, lastFullMB = 0, rows = 0, lastRow = 1000;
                const byteLog = new PassThrough({
                    objectMode: true,
                    transform(chunk, encoding, callback) {
                        rows++;
                        if(rows >= lastRow) {
                            console.debug(`total rows greater than ${lastRow}`);
                            lastRow = lastRow << 1;
                        }
                        bytes += sizeOf(chunk);
                        if(bytes/1024/1024 >= lastFullMB) {
                            console.debug(`total byte flow greater than ${bytes / 1024 / 1024} MB`);
                            lastFullMB += 10;
                        }
                        callback(null, chunk);
                    }
                });
                return s.pipe(byteLog).pipe(toCsv);
            } else {
                return s.pipe(toCsv);
            }
        } catch(ex) {
            throw new Error(ex);
        }
    }
}

module.exports = SQL;