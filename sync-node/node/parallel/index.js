const { Worker, MessageChannel } = require('worker_threads');
const net = require('../../net');

(async function () {

    let emitEventChannel = new MessageChannel();
    let emitBlockChannel = new MessageChannel();

    let version = await net.getVersion();
    let preblockHeaderWorker = new Worker(`${__dirname}/pretask-downloadblockheader.js`);
    preblockHeaderWorker.postMessage(version);

    let preblockEventWorker = new Worker(`${__dirname}/pretask-downloadblockevent.js`);
    preblockEventWorker.postMessage(version);

    new Worker(`${__dirname}/executetask-validateblockheader.js`);
    new Worker(`${__dirname}/executetask-validateblockevent.js`);

})();
