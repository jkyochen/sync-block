const { parentPort } = require('worker_threads');
const { sha256ToString } = require('../../hash/hash');

parentPort.on('message', async (data) => {
    try {

        let block = {
            ...data.blockHeader,
            txs: data.blockEvents
        }

        if (data.hash === sha256ToString(block)) {
            console.log(true)
        } else {
            console.log(false);
        }

    } catch (error) {
        console.log(error);
        parentPort.close();
    }
});
