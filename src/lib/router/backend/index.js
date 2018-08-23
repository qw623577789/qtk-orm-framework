const Redis = require('./redis');
const Mysql = require('./mysql');

module.exports = class {
    static create(config, key) {
        const connParam = config.hash(key);
        switch(connParam.media) {
            case 'mysql':
                return new Mysql(connParam);
            case 'redis':
                return new Redis(connParam);
            default:
                throw new Error(`unsupported media[${connParam.media}]`);
        }
    }
}