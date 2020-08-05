const { parentPort } = require('worker_threads');

const { db, layout } = require('../store');
const net = require('../net');
let pause = false;

async function downloadBlockHeader(height) {
    let h = 0;
    let downloaded_latest_height = await db.get(layout.height.encode(0));
    if (downloaded_latest_height) {
        downloaded_latest_height = JSON.parse(downloaded_latest_height);
        h = downloaded_latest_height + 1;
    }

    for (; h <= height; h++) {
        if (pause) {
            return;
        }

        let data = await net.getBlockHeaderByHeight(h);
        let blockHeader = data.block;
        await db.put(layout.block.encode(0, Buffer.from(blockHeader.hash, "hex")), Buffer.from(JSON.stringify(blockHeader)));
        await db.put(layout.height.encode(0), Buffer.from(JSON.stringify(h)));
    }
}

parentPort.on('message', async (message) => {
    try {
        await db.open();
        await downloadBlockHeader(message.max_height);
        await db.close();
    } catch (error) {
        console.log(error);
        parentPort.close();
    }
});
