#!/usr/bin/env node
const opts = require('opts');
const path = require('path');
const Builder = require('./builder');
const Executor = require('./executor');

opts.parse(
    [
        { 
            short       : 'd',
            long        : 'dir',
            description : '定义文件目录',
            value       : true,
            required    : true, 
        },
        {
            short       : 'k',
            long        : 'key-spec',
            description : 'key的mysql属性，例如:VARCHAR(255)',
            value       : true,
            required    : true
        }
    ],
    [
        { name : 'module', required: true },
    ], true);

const routerDir = path.resolve(`${opts.get('dir')}/router`);
const keyspec   = opts.get('key-spec');
const builder = new Builder(keyspec, routerDir, opts.args()[0]);
const executor = new Executor();

executor.exec(builder.exec()).catch(err => {
    console.error(err.stack);
    process.exit(-1);
});