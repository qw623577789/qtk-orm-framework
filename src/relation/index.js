const assert = require('assert');
const Mutex = require('key_mutex');
const SchemaValidator = require('../lib/validator');
const ValueFixer = require('../lib/fixer');
const Router = require('../lib/router');
module.exports = class R {
    static get Order() {
        return {ASC: 0, DESC: 1};
    }
    
    constructor(name) {
        const {definitionDir, removeSchemaUndefinedProperties} = require('../global');
        this._schema = require(`${definitionDir.relation}/schema/${name.split('.').join('/')}`);
        this._router = new Router(name, `${definitionDir.relation}/router`);
        this._mutex = Mutex.mutex();
    }

    async _load(subject) {
        const relations = await this._router.get(subject);
        if (relations === undefined) {
            return [];
        }
        assert(Array.isArray(relations), `expect data to be an array of subject ${subject} ${relations}`);
        return relations;
    }

    async _save(subject, relations) {
        await this._router.set(subject, relations);
    }

    async fetch(subject, object) {
        const {removeSchemaUndefinedProperties} = require('../global');
        const relations = await this._load(subject);
        const position = relations.findIndex(_ => _.object === object);
        if (position < 0) {
            return undefined;
        }
        let relation = Object.assign({subject}, relations[position]);
        relation = ValueFixer.from(this._schema).fix(relation, removeSchemaUndefinedProperties);
        let validator = SchemaValidator.from(this._schema);
        let isPass = validator.validate(relation);
        if (isPass == false) throw new Error(validator.errorText);
        return relation;
    }

    async put(relation) {
        let validator = SchemaValidator.from(this._schema);
        let isPass = validator.validate(relation);
        if (isPass == false) throw new Error(validator.errorText);

        const subject = relation.subject;
        relation = Object.assign({}, relation);
        delete relation.subject;

        await this._mutex.lock(subject, async() => {
            let relations = await this._load(subject);
            const position = relations.findIndex(_ => _.object === relation.object);
            if (position < 0) {
                relations.push(relation);
            }
            else {
                relations[position] = relation;
            }
            await this._save(subject, relations);
        });
    }

    async has(subject, object) {
        return (await this.fetch(subject, object) !== undefined);
    }

    async remove(subject, object) {
        await this._mutex.lock(subject, async() => {
            let relations = await this._load(subject);
            const position = relations.findIndex(_ => _.object === object);
            if (position >= 0) {
                relations.splice(position, 1);
                await this._save(subject, relations);
            }
        });       
    }

    async removeAll(subject) {
        return await this._save(subject,[]);
    }

    async count(subject) {
        let relations = await this._load(subject);
        return relations.length;
    }

    async list(subject, property, order, offset = undefined, number = undefined) {
        const {removeSchemaUndefinedProperties} = require('../global');
        let relations = await this._load(subject);
        relations = relations.map(item => {
            item = Object.assign({subject}, item);
            item = ValueFixer.from(this._schema).fix(item, removeSchemaUndefinedProperties);
            let validator = SchemaValidator.from(this._schema);
            let isPass = validator.validate(item);
            if (isPass == false) throw new Error(validator.errorText);
            return item;
        });

        relations.sort((lhs, rhs) => {
            return (order === R.Order.ASC) ? lhs[property] - rhs[property] : rhs[property] - lhs[property];
        });

        if (offset !== undefined) {
            relations.splice(0, offset);
        }
        if (number !== undefined) {
            relations.splice(number);
        }

        return relations;
    }
}