# qtk-orm-framework

qtk-orm-framework is an orm database framework, support mysql and redis. This framework aim at providing a single and simple api to describe/operate with k-v type data in both cache and relationship databases. Developer what need to do is just write a data structure schema, and router (means the configuration of database server), and then the framework will help you to build mysql table, create/read/update/delete/transfer data simplify.

## Installation

    # in your project
    npm install @qtk/orm-framework --save
    # install global
    npm install @qtk/orm-framework -g

## Usage

- ### Bin
  - #### Create Table
    ``` shell
    orm_build_mysql -d <definition path> -k <primary key type> <module name>

    # example
    orm_build_mysql -d ./example/object -k 'VARCHAR(16)' user
    orm_build_mysql -d ./example/relation -k 'VARCHAR(255)' user.message
    ```
  - #### Drop Table
    ``` shell
    orm_destroy_mysql -d <definition path> <module name>

    #example
    orm_destroy_mysql -d ./example/object user
    orm_destroy_mysql -d ./example/relation user.message
    ```
  - #### Truncate Table
    ``` shell
    orm_purge_data -d <definition path> <module name>

    #example
    orm_purge_data -d ./example/object user
    orm_purge_data -d ./example/relation user.message
    ```

- ### API
  - #### Object
    - has(id)
    - get(id)
    - set(object)
    - del(id)
  - #### Relation
    - fetch(subject, object)
    - has(subject, object)
    - put(relation)
    - remove(subject, object)
    - removeAll(subject)
    - count(subject)
    - list(subject, propertyName, order, offset=undefined, number=undefined)


``` js
const ORM = require('@qtk/orm-framework');
ORM.setup({
    objectPath: `${__dirname}/example/object`,
    relationPath: `${__dirname}/example/relation`,
    removeSchemaUndefinedProperties: false // if value has schema undefined properties,whether or not to remove them for passing the schema check when get/fetch/list
});
const ObjectUser = new ORM.Object('user');
const ObjectMessage = new ORM.Object('message');
const RelationUserMessage = new ORM.Relation('user.message');

const user = {
    id: '0000000000000001',
    name: 'Cindy',
    gender: 0,
    money: 110,
    null: null,
    location: {
        lng: '113.46',
        lat: '22.27'
    },
    isVip: false,
    friends: [],
    extraObject: {
        count: 1
    }
}
const message = {
    id: 1,
    title: "hello",
    content: "hey",
    sendTime: 1516538014
}
const userMessage = {
    subject: '0000000000000001',
    object: 1,
    status: 1,
    readTime: 1516538014
}

await ObjectUser.set(user);
await ObjectMessage.set(message);
console.log(await ObjectUser.has(user.id));
console.log(await ObjectUser.get(user.id));

await RelationUserMessage.put(userMessage);
console.log(await RelationUserMessage.has(user.id, message.id));
console.log(await RelationUserMessage.fetch(user.id, message.id));
console.log(await RelationUserMessage.count(user.id));
console.log(await RelationUserMessage.list(user.id, 'readTime', ORM.Relation.Order.ASC));

console.log(await RelationUserMessage.remove(user.id, message.id));
console.log(await RelationUserMessage.removeAll(user.id));
console.log(await ObjectUser.del(user.id));
console.log(await ObjectMessage.del(message.id));
```

## Schema Definition

- Keyword
  - **id** : special key for object
  - **subject** : special key for relation
  - **object** : special key for relation
  - **string** : type for value
  - **boolean** : type for value
  - **integer** : type for value
  - **number** : type for value
  - **object** : type for value
  - **array** : type for value
  - **empty** : type for value

- Method
    - **desc(value)** : describe the field
    - **example(value)** : give a example for the field
    - **default(value)** : give a default value for the field, **if the field be required and target value is undefined, it will use default value to replace it when use get/fetch/list method **
    - **enum(value1,value2...)** : target string/boolean/number/integer value must in enum
    - **max(value)** : target integer/number maximum limit    
    - **min(value)** : target integer/number minimum limit
    - **max(value)** : target integer/number maximum limit
    - **exclusiveMin(value)** : target integer/number target value must bigger than value
    - **exclusiveMax(value)** : target integer/number target value must less than value
    - **multipleOf(value)** : target integer/number target value must multiple of value
    - **minItems(value)** : target array minimum items limit
    - **maxItems(value)** : target array maximum items limit
    - **length(value)** : target array items length limit
    - **contains(value)** : target array must has designated item
    - **uniqueItems(value)** : target array must be a unique array
    - **item(value/array)** : target array item must match the rule
    - **maxLength(value)** : target string minimum length limit
    - **minLength(value)** : target string maximum length limit
    - **length(value)** : target string length limit
    - **pattern(value)** : target string must match the regex
    - **properties(object)** : describe target object properties
    - **patternProperties(object)** : use regex to describe target object properties
    - **additionalProperties(boolean)** : target object can has other properties besides [properties] description          
    - **require(value1, value2...)** : target object must has special properties
    - **requireAll()** : target object must has all of [properties] description
    - **length(value)** : string length limit
    - **pattern(value)** : string must match the regex
    - **if...then...elseIf...else...endIf** : target object can has different properties/patternProperties/require in different properties/patternProperties situation 

- Sugar

| sugar          | equivalent                                   |
| -------------- | -------------------------------------------- |
| 1              | integer().enum(1)                            |
| 1.1            | number().enum(1.1)                           |
| 'foo'          | string().enum('foo')                         |
| /^foo\|bar$/   | string().pattern(/^foo\|bar$/)               |
| true           | boolean().enum(true)                         |
| null           | NULL() or empty()                            |
| {foo: 1}       | object().properties({foo: 1}).requiredAll().additionalProperties(false)  |
| [1, 2, 3]      | integer().enum(1, 2, 3)                      |
| [1.1, 2.2, 3]  | number().enum(1.1, 2.2, 3)                   |
| ['foo', 'bar'] | string().enum('foo', 'bar')                  |
| [true, false]  | boolean().enum(true, false)                  |

```javascript
module.exports = {
    id: string().length(16),
    name: string(),
    gender: integer().enum(0, 1),
    money: number().min(0),
    null: empty(),
    location: {
        lng: string(),
        lat: string().desc('lat')
    },
    isVip: boolean(),
    friends: array().item({
        fid: string().pattern(/^[A-Za-z0-9]{1,}$/),
        time: integer()
    }),
    extraObject: object({
        count: integer()
    }).default({count: 10}),
    extraArray: array(string()).default(['default array']),//array use sugar
    extraInteger: integer().default(0),
    extraNumber: number().default(0.9),
    extraBoolean: boolean().default(false),
    extraString: string().default("default")
};
```

```javascript
module.exports = object({
    subject: string(),
    object: integer(),
    status: integer().enum(0, 1, 2).desc('0:未读; 1:已读; 2:已删'),
    readTime: integer().default(0),
    deletedTime: integer().default(0)
})
    .if.properties({status: 1})
    .then.require('subject', 'object', 'status', 'readTime').additionalProperties(false)
    .elseIf.properties({status: 2})
    .then.require('subject', 'object', 'status', 'deletedTime').additionalProperties(false)
    .else
    .require('subject', 'object', 'status').additionalProperties(false)
    .endIf
```

## Router Definition

Router file has two type, currently and deprecated. current definition describe the new storage server, while the deprecated show the old server. when deprecated one is exist, the framework to will get from the new at first, if get nothing, then will check for the old server, and, copy to the new one. They lie in the same folder, such as

```
user.deprecated.js
user.js
```
```javascript
module.exports = {
    persistence: {
        shards: [
            {
                media: "mysql",
                host: "localhost",
                port: 3306,
                user: "root",
                password: "",
                database: "db_test_game",
                table: "o_user",
            }
        ],
        hash: function (id) {
            return this.shards[0];
        }
    },
    cache: {
        shards: [
            {
                media: "redis",
                host: "localhost",
                port: 6379,
                bucket: 'o_user_'
            }
        ],
        hash: function (id) {
            return this.shards[0];
        }
    }
};
```

## Acknowledge
schema definition grammar is base in part on the source code of the [semantic-schema](https://www.npmjs.com/package/semantic-schema) project