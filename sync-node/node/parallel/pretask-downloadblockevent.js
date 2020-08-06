const { parentPort } = require('worker_threads');
const net = require('../../net');
let pause = false;

parentPort.on('message', async (eventHashs) => {
    try {
        for (let i = 0; i < eventHashs.length; i++) {
            if (pause) {
                return;
            }
            let hash = eventHashs[i];
            let data = await net.getBlockEventByHash(hash);
            parentPort.postMessage({
                hash: hash,
                event: data.event,
            });
        }
    } catch (error) {
        console.log(error);
        parentPort.close();
    }
});
