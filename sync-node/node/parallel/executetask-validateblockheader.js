const { parentPort } = require('worker_threads');
const hash = require('./hash');

async function executeValidateBlockHeader(hash) {

}

parentPort.on('message', async (hash) => {
    try {
        let waitValidateBlockHeader = await db.get(layout.block.encode(0, hash));
        waitValidateBlockHeader = JSON.parse(waitValidateBlockHeader);
        if (hash === sha256ToString(waitValidateBlockHeader)) {
            console.log(hash, true)
        } else {
            console.log(hash, false);
        }
    } catch (error) {
        console.log(error);
        port.close();
        parentPort.close();
    }
});
