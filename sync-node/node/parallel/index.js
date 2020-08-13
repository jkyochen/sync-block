const { Worker } = require('worker_threads');
const { default: PQueue } = require('p-queue');
const net = require('../../net');
const { db, layout } = require('../../store');

async function preblockHeaderTask(max_height) {

    let preblockHeaderWorker = new Worker(`${__dirname}/pretask-downloadblockheader.js`);
    preblockHeaderWorker.on('message', (data) => {
        const queue = new PQueue({ concurrency: 1 });
        queue.add(async () => {
            await db.put(layout.height.encode(0), Buffer.from(JSON.stringify(data.blockHeader.height)));
            await db.put(layout.block.encode(0, Buffer.from(data.hash, "hex")), Buffer.from(JSON.stringify(data.blockHeader)));
            await db.put(layout.list.encode(3, data.blockHeader.height), Buffer.from(JSON.stringify(data.hash)));
        });
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

        // l[0][height]
        let waitDownloadEventHashInHeight = await db.get(layout.list.encode(0, height));
        if (!waitDownloadEventHashInHeight) {
            await db.put(layout.list.encode(0, height), Buffer.from(JSON.stringify(eventHashs)));
            return eventHashs;
        }

        // l[1][height]
        let downloadedEventHashInHeight = await db.get(layout.list.encode(1, height));
        if (downloadedEventHashInHeight) {
            downloadedEventHashInHeight = JSON.parse(downloadedEventHashInHeight);
            return eventHashs.filter(hash => !downloadedEventHashInHeight.includes(hash));
        }

        return eventHashs;
    }

    let preblockEventWorker = new Worker(`${__dirname}/pretask-downloadblockevent.js`);
    preblockEventWorker.on('message', (data) => {
        const queue = new PQueue({ concurrency: 1 });
        queue.add(async () => {
            await db.put(layout.event.encode(0, Buffer.from(data.hash, "hex")), Buffer.from(JSON.stringify(data.event)));

            // l[1][height]
            let downloadedEventHashInHeight = await db.get(layout.list.encode(1, data.event.height));
            if (!downloadedEventHashInHeight) {
                downloadedEventHashInHeight = [];
            } else {
                downloadedEventHashInHeight = JSON.parse(downloadedEventHashInHeight);
                downloadedEventHashInHeight.push(data.hash);
            }
            await db.put(layout.list.encode(1, data.event.height), Buffer.from(JSON.stringify(downloadedEventHashInHeight)));

            executeValidateBlockEvent.postMessage(data);
        });
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

    const queue = new PQueue({ concurrency: 1 });
    executeValidateBlockEventWorker.on('message', (data) => {
        queue.add(async () => {
            try {
                let height = data.event.height;
                console.log(height);

                // l[2][height]
                let validatedEventHashInHeight = await db.get(layout.list.encode(2, height));
                if (!validatedEventHashInHeight) {
                    validatedEventHashInHeight = [];
                } else {
                    validatedEventHashInHeight = JSON.parse(validatedEventHashInHeight);
                }
                if (!validatedEventHashInHeight.includes(data.hash)) {
                    validatedEventHashInHeight.push(data.hash);
                }
                await db.put(layout.list.encode(2, height), Buffer.from(JSON.stringify(validatedEventHashInHeight)));

                // l[0][height]
                let waitDownloadEventHashInHeight = await db.get(layout.list.encode(0, height));
                if (!waitDownloadEventHashInHeight) {
                    throw "wait download list is empty";
                }
                waitDownloadEventHashInHeight = JSON.parse(waitDownloadEventHashInHeight);

                if (waitDownloadEventHashInHeight.length === validatedEventHashInHeight.length) {
                    if (!waitDownloadEventHashInHeight.every(r => validatedEventHashInHeight.includes(r))) {
                        throw "validate list exist Unknown block event hash";
                    }
                    let hash = await db.get(layout.list.encode(3, height));
                    executeValidateBlockHeader.postMessage(JSON.parse(hash));
                }
            } catch (error) {
                console.error(error);
                executeValidateBlockEventWorker.close();
            }
        });
    });

    return executeValidateBlockEventWorker;
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

    // when worker is close
    // await db.close();
})();
