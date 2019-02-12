const AWS = require('aws-sdk');

class S3 {
    constructor(config) {
        this.s3 = new AWS.S3({
            accessKeyId: config.accessKey,
            secretAccessKey: config.secretKey,
            region: config.region || 'us-east-1'
        });
    }

    async upload(stream, location) {
        return new Promise((resolve, reject) => {
            this.s3.upload({Bucket: location.bucket, Key: location.key, Body: stream}, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    if(process.env.DEBUG) {
                        console.debug(`Resolving upload at ${new Date()}\n${JSON.stringify(data)}\n`);
                    }
                    resolve(data);
                }
            });
        });
    }
}

module.exports = S3;