const redis = require('redis');
const {redisClient} = require('../../../../global');

module.exports = class {
    constructor(connParam) {
        this._connParam = connParam;
        if (redisClient[connParam.host] == undefined) {
            redisClient[connParam.host] = redis.createClient({
                host: connParam.host,
                port: connParam.port,
                retry_strategy: ()=>{
                    console.error(`redis disconnect`);
                    return 50;
                }
            });
        }
        this._redisClient = redisClient[connParam.host];
    }

    async set(key, data) {
        key = `${this._connParam.bucket}.${key}`;
        return new Promise((resolve, reject) => {
            this._redisClient.set(key, JSON.stringify(data), (error, result) => {
                if (error != undefined) return reject(error);
                return resolve();
            })
        })
    }

    async get(key) {
        key = `${this._connParam.bucket}.${key}`;
        return new Promise((resolve, reject) => {
            this._redisClient.get(key, (error, result) => {
                if (error != undefined) return reject(error);
                return resolve(JSON.parse(result));
            })
        })
    }

    async del(key) {
        key = `${this._connParam.bucket}.${key}`;
        return new Promise((resolve, reject) => {
            this._redisClient.del(key, (error, result) => {
                if (error != undefined) return reject(error);
                return resolve(result);
            })
        })
    }

};