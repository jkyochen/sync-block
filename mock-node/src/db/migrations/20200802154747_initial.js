const tableNames = require('../../constants/tableNames');

exports.up = async (knex) => {
    await knex.schema.createTable(tableNames.block, (table) => {
        table.integer("height").notNullable();
        table.string("hash", 32).notNullable();
        table.string("previousBlockHash", 32).notNullable();
        table.integer("timestamp").notNullable();
        table.integer("txsNumber").notNullable();
        table.integer("nonce").notNullable();
    });

    await knex.schema.createTable(tableNames.event, (table) => {
        table.integer("height").notNullable();
        table.string("hash", 32).notNullable();
        table.string("sender", 32).notNullable();
        table.string("recipient", 32).notNullable();
        table.integer("amount").notNullable();
        table
            .integer(`${tableNames.block}_id`)
            .unsigned()
            .references("id")
            .inTable(tableNames.block)
            .onDelete("cascade");
    });
};

exports.down = async (knex) => {
    await Promise.all(
        [tableNames.block, tableNames.event]
            .reverse()
            .map((name) => knex.schema.dropTableIfExists(name))
    );
};
