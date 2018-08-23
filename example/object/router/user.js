module.exports = {
    persistence: {
        shards: [
            {
                media: "mysql",
                host: "localhost",
                port: 3306,
                user: "root",
                password: "",
                database: "db_test",
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
                host: "127.0.0.1",
                port: 6379,
                bucket: "db_test.o_user",
            }
        ],
        hash: function (id) {
            return this.shards[0];
        }
    }
};