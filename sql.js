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
        try {
            const header = await this.knex.withSchema(t.schema).from(t.table).columnInfo();
            const csv = createCsvStringifier({header: Object.keys(header), fieldDelimiter: ';'});
            const toCsv = new Transform({
                objectMode: true,
                transform(chunk, encoding, callback) {
                    callback(null, csv.stringifyRecords([chunk]))
                }
            });
            const s = this.knex.withSchema(t.schema).select('*').from(t.table).timeout(60000*3*10).stream()/*.on('start', function(builder) {
                console.debug(builder);
            }).on('query', function(data) {
                console.debug(data);
            }).on('query-error', function(error, obj) {
                console.debug(error, obj);
            }).on('query-response', function(response, obj, builder) {
                console.debug(response, obj, builder);
            });*/
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
                let bytes = 0, lastFullMB = 0;
                const byteLog = new PassThrough({
                    objectMode: true,
                    transform(chunk, encoding, callback) {
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