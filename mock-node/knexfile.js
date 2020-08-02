require("dotenv").config();

module.exports = {
    test: {
        client: "sqlite3",
        connection: {
            filename: `${process.env.dbfile}_test.db`,
        },
        migrations: {
            directory: "./src/db/migrations",
        },
        seeds: {
            directory: "./src/db/seeds",
        },
        useNullAsDefault: true
    },
    development: {
        client: "sqlite3",
        connection: {
            filename: `${process.env.dbfile}.db`,
        },
        migrations: {
            directory: "./src/db/migrations",
        },
        seeds: {
            directory: "./src/db/seeds",
        },
        useNullAsDefault: true
    },
};
