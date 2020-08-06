const { Worker } = require('worker_threads');
const net = require('../../net');
const { db, layout } = require('../../store');

async function preblockHeaderTask(max_height) {

    let preblockHeaderWorker = new Worker(`${__dirname}/pretask-downloadblockheader.js`);
    preblockHeaderWorker.on('message', async (data) => {
        await db.put(layout.height.encode(0), Buffer.from(JSON.stringify(data.height)));
        await db.put(layout.block.encode(0, Buffer.from(data.block.hash, "hex")), Buffer.from(JSON.stringify(data.block.blockHeader)));
        // console.log(data.block.hash);
    });

    let init_height = 0;
    let downloaded_latest_height = await db.get(layout.height.encode(0));
    if (downloaded_latest_height) {
        init_height = JSON.parse(downloaded_latest_height);
    }

    preblockHeaderWorker.postMessage({
        init_height: init_height,
        max_height: max_height,
    });
}

async function preblockEventTask(max_height, executeValidateBlockEvent) {

    async function getNeedDownloadBlockEventHashs(height) {

        let data = await net.getBlockEventsByHeight(height);
        let eventHashs = data.eventHashs;

        let waitDownloadEventHashInHeight = await db.get(layout.list.encode(0, height));
        if (!waitDownloadEventHashInHeight) {
            await db.put(layout.list.encode(0, height), Buffer.from(JSON.stringify(eventHashs)));
            return eventHashs;
        }

        let downloadedEventHashInHeight = await db.get(layout.list.encode(1, height));
        if (downloadedEventHashInHeight) {
            downloadedEventHashInHeight = JSON.parse(downloadedEventHashInHeight);
            return eventHashs.filter(hash => !downloadedEventHashInHeight.includes(hash));
        }

        return eventHashs;
    }

    let preblockEventWorker = new Worker(`${__dirname}/pretask-downloadblockevent.js`);
    preblockEventWorker.on('message', async (data) => {
        await db.put(layout.event.encode(0, Buffer.from(data.hash, "hex")), Buffer.from(JSON.stringify(data.event)));
        // console.log(data);
        // TODO save to wait downloaded
        executeValidateBlockEvent.postMessage(data);
    });

    let init_height = 0;
    let downloaded_event_latest_height = await db.get(layout.height.encode(1));
    if (downloaded_event_latest_height) {
        init_height = JSON.parse(downloaded_event_latest_height);
    }

    for (let h = init_height; h < max_height; h++) {
        await db.put(layout.height.encode(1), Buffer.from(JSON.stringify(h)));
        preblockEventWorker.postMessage(await getNeedDownloadBlockEventHashs(h));
    }
}

function executeValidateBlockEventTask(executeValidateBlockHeader) {
    let executeValidateBlockEventWorker = new Worker(`${__dirname}/executetask-validateblockevent.js`);

    executeValidateBlockEventWorker.on('message', () => {

        executeValidateBlockHeader.postMessage("");
    });

    return executeValidateBlockEvenstWorker;
}

function executeValidateBlockHeaderTask() {
    let executeValidateBlockHeaderWorker = new Worker(`${__dirname}/executetask-validateblockheader.js`);
    return executeValidateBlockHeaderWorker;
}

(async function () {

    await db.open();

    let executeValidateBlockHeader = executeValidateBlockHeaderTask();
    let executeValidateBlockEvent = executeValidateBlockEventTask(executeValidateBlockHeader);

    let version = await net.getVersion();
    await preblockHeaderTask(version.max_height);
    await preblockEventTask(version.max_height, executeValidateBlockEvent);

    // await db.close();
})();
