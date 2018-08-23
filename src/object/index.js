const SchemaValidator = require('../lib/validator');
const ValueFixer = require('../lib/fixer');
const Router = require('../lib/router');

module.exports = class {
    constructor(name) {
        const {definitionDir, removeSchemaUndefinedProperties} = require('../global');
        this._schema = require(`${definitionDir.object}/schema/${name}`);
        this._router = new Router(name, `${definitionDir.object}/router`);
    }

    async has(id) {
        return (await this._router.get(id) !== undefined);
    }

    async get(id) {
        const {removeSchemaUndefinedProperties} = require('../global');
        let obj = await this._router.get(id);
        if (obj === undefined) return undefined;
        obj = Object.assign({id}, obj);
        obj = ValueFixer.from(this._schema).fix(obj, removeSchemaUndefinedProperties);
        let validator = SchemaValidator.from(this._schema);
        let isPass = validator.validate(obj);
        if (isPass == false) throw new Error(validator.errorText);
        return obj;
    }

    async set(obj) {
        obj = ValueFixer.from(this._schema).fix(obj);
        let validator = SchemaValidator.from(this._schema);
        let isPass = validator.validate(obj);
        if (isPass == false) throw new Error(validator.errorText);
        const id = obj.id;
        obj = Object.assign({}, obj);
        delete obj.id;
        await this._router.set(id, obj);
    }

    async del(id) {
        await this._router.del(id);
    }
}