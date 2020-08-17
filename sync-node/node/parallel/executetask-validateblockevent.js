const { parentPort } = require('worker_threads');
const { sha256ToString } = require('../../hash/hash');

parentPort.on('message', async (data) => {
    try {
        if (data.hash !== sha256ToString(data.event)) {
            throw "Event has been changed";
        }
        parentPort.postMessage(data);
    } catch (error) {
        console.log(error);
        parentPort.close();
    }
});
