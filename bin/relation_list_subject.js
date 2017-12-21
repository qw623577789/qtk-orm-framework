#!/usr/bin/env node
const mysqlPool = require('../src/lib/mysql_pool');
const Mysql = require('mysql');
const opts = require('opts');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

opts.parse([
    {
        short       : 'r',
        long        : 'router-dir',
        description : 'router path',
        value       : true,
        required    : true
    }
], [
    { 
        name: 'relation_name',
        required: true
    }
], true);

const routerPath = path.resolve(opts.get('router-dir'));
const relationName = opts.arg('relation_name');
assert(fs.lstatSync(routerPath).isDirectory(), `routerPath(${routerPath}) is expected to be a directory`);

list()
.then(process.exit)
.catch(err => {
    console.error(err);
    process.exit(-1);
});

async function list() {
    let router = require([routerPath, 'relation', ...relationName.split('.')].join('/'));
    for(let shard of router.shards) {
        let mysql = await mysqlPool.fetch(shard);
        let batchSize = 1000;
        let count = await countAll(shard);
        for(let start = 0; start < count; start += batchSize) {
            let subjectList = await dump(shard, [start, batchSize]);
            subjectList.map(id => console.log(id));
        }
    }
}

async function countAll(shard) {
    const mysql = await mysqlPool.fetch(shard);
    const sql = Mysql.format('SELECT count(*) as num FROM ??.??', [shard.database, shard.table]);
    return await new Promise((resolve, reject) => {
        mysql.query(sql, (error, rows, fields) => {
            mysql.release();
            error ? reject(error) : resolve(rows[0].num);
        });
    });
}

async function dump(shard, limit) {
    const mysql = await mysqlPool.fetch(shard);
    // a subject exists in only one shard.
    const sql = Mysql.format('SELECT DISTINCT subject FROM ??.?? LIMIT ?, ?', [shard.database, shard.table, ...limit]);
    return await new Promise((resolve, reject) => {
        mysql.query(sql, (error, rows, fields) => {
            mysql.release();
            error ? reject(error) : resolve(rows.map(row => row.subject));
        });
    });
}