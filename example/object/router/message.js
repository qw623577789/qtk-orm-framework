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
                table: "o_message",
            }
        ],
        hash: function (id) {
            return this.shards[0];
        }
    }
};