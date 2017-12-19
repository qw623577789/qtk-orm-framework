#!/usr/bin/env node
const opts = require('opts');
const path = require('path');
const fs = require('fs');
const log4js = require('log4js');
const tools = require(`${__dirname}/../src/tools`);

opts.parse(
    [
        { 
            short       : 's',
            long        : 'schema_dir',
            description : 'schema资源目录',
            value       : true,
            required    : true, 
        },
        { 
            short       : 'r',
            long        : 'router_dir',
            description : 'router资源目录',
            value       : true,
            required    : true, 
        },
        {
            short       : 'l',
            long        : 'log_file',
            description : '日志文件绝对路径',
            value       : true,
            required    : true
        },
        {
            long        : 'preview',
            description : '只打印执行sql日志,不实际生成数据库',
        }
    ]
    ,
    [
        { name : 'type' , required : true },
        { name : 'module', required: true },
    ], true);

let schemaDir = opts.get('s');
let routerDir = opts.get('r');
let type = opts.args()[0];
let moduleName = opts.args()[1];


const halt = (msg) => {
    console.error(msg);
    process.exit(-1);
};

if (type != 'object' && type != 'relation') {
    halt('type should be object or relation');
}

log4js.configure({
    appenders: [
        {
            type: 'dateFile',
            filename: opts.get('l'),
            category: 'default'
        }
    ]
});
global.logger = log4js.getLogger('default');

const schemaFile = `${schemaDir}/${type}/${moduleName.replace(/\./g, '/')}.js`;
const routerFile = `${schemaDir}/${type}/${moduleName.replace(/\./g, '/')}.js`;

if (!fs.existsSync(schemaFile)) {
    halt(`${schemaFile} is not exist`);
}

if (!fs.existsSync(`${routerFile}`)) {
    halt(`${routerFile} is not exist`);
}


tools.build('mysql', schemaDir, routerDir, type, moduleName, opts.get('preview'));