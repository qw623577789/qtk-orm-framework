const {integer, boolean, string, object} = require('../../../../').Type;

module.exports = object({
    subject: string(),
    object: integer(),
    status: integer().enum(0, 1, 2).desc('0:未读; 1:已读; 2:已删'),
    readTime: integer().default(0),
    deletedTime: integer().default(0)
})
    .if.properties({status: 1})
    .then.require('subject', 'object', 'status', 'readTime')
    .elseIf.properties({status: 2})
    .then.require('subject', 'object', 'status', 'deletedTime')
    .else
    .require('subject', 'object', 'status')
    .endIf