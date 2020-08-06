require("dotenv").config();

const sha256 = require("bcrypto/lib/sha256");
const { v4: uuidv4 } = require("uuid");
const tableNames = require("../../constants/tableNames");

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function sha256ToString(o) {
    return sha256.digest(Buffer.from(JSON.stringify(o))).toString("hex");
}

exports.seed = async (knex) => {
    await knex(tableNames.event).del();
    await knex(tableNames.block).del();

    let blockHeight = process.env.blockHeight;
    let previousBlockHash =
        "0000000000000000000000000000000000000000000000000000000000000000";
    let txCount = 0;

    for (let h = 0; h <= blockHeight; h++) {
        let block = {
            height: h,
            timestamp: Date.now(),
            previousBlockHash: previousBlockHash,
        };

        let coinbase = {
            height: h,
            sender: "00",
            recipient: uuidv4().split("-").join(""),
            amount: 5,
        };
        coinbase.hash = sha256ToString(coinbase);

        let txs = [coinbase];
        for (let j = 0; j < getRandomArbitrary(0, 5); j++) {
            let tx = {
                height: h,
                sender: uuidv4().split("-").join(""),
                recipient: uuidv4().split("-").join(""),
                amount: getRandomArbitrary(1, 50),
            };
            tx.hash = sha256ToString(tx);
            txs.push(tx);
        }
        block.txs = txs;
        block.txsNumber = txs.length;

        block.hash = sha256ToString(block);
        block.nonce = 0; // TODO

        delete block.txs;
        const [block_id] = await knex(tableNames.block).insert(block);

        txs.forEach(async (t) => {
            await knex(tableNames.event).insert({
                ...t,
                block_id: block_id,
            });
        });
        txCount += txs.length;
    }

    console.log(`Created: ${blockHeight} Block, ${txCount} Event.`);
};
