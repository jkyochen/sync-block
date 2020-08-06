const { parentPort } = require('worker_threads');
const hash = require('./hash');

parentPort.on('message', async (data) => {
    try {
        if (data.hash !== hash.sha256ToString(data.event)) {
            throw ("Event has been changed");
        }
        parentPort.postMessage();
    } catch (error) {
        console.log(error);
        port.close();
        parentPort.close();
    }
});
