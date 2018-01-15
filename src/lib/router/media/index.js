const ObjectMysqlStorage = require('./mysql/object');
const RelationMysqlStorage = require('./mysql/relation');
const ObjectMemcacheStorage = require('./memcache/object');

module.exports = class {
    static create(type, connParam) {
        switch (connParam.media) {
            case 'mysql':
                switch (type) {
                    case 'object': return new ObjectMysqlStorage(connParam);
                    case 'relation': return new RelationMysqlStorage(connParam);
                    default: throw new Error(`unsupported storage[${connParam.media}][${type}]`);
                }
            case 'memcache':
                switch (type) {
                    case 'object': return new ObjectMemcacheStorage(connParam);
                    default: throw new Error(`unsupported storage[${connParam.media}][${type}]`);
                }
            default:
                throw new Error(`unsupported storage[${connParam.media}]`);
        }

    }
}