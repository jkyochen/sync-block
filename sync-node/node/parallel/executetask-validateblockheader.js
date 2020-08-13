const { parentPort } = require('worker_threads');
const { sha256ToString } = require('./hash');

async function executeValidateBlockHeader(hash) { }

parentPort.on('message', async (data) => {
    try {

        // let waitValidateBlockHeader = await db.get(layout.block.encode(0, hash));
        // waitValidateBlockHeader = JSON.parse(waitValidateBlockHeader);
        // if (hash === sha256ToString(waitValidateBlockHeader)) {
        //     console.log(hash, true)
        // } else {
        //     console.log(hash, false);
        // }

        console.log(data);

    } catch (error) {
        console.log(error);
        parentPort.close();
    }
});
