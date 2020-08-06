const { parentPort } = require('worker_threads');
const net = require('../../net');
let pause = false;

parentPort.on('message', async ({ init_height, max_height }) => {
    try {
        for (let h = init_height; h <= max_height; h++) {
            if (pause) {
                return;
            }
            let data = await net.getBlockHeaderByHeight(h);
            parentPort.postMessage({
                height: h,
                block: data,
            });
        }
    } catch (error) {
        console.log(error);
        parentPort.close();
    }
});
