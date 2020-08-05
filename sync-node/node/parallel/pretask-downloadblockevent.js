const { parentPort } = require('worker_threads');

const { db, layout } = require('../store');
const net = require('../net');
let pause = false;

async function getNeedDownloadBlockEventHashs(height) {

    let data = await net.getBlockEventsByHeight(h);
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

async function downloadBlockEvents(hashs) {
    for (let i = 0; i < hashs.length; i++) {
        let data = await net.getBlockEventByHash(hashs[i]);
        let event = data.event;
        await db.put(layout.event.encode(0, hash), Buffer.from(JSON.stringify(event)));
    }
}

parentPort.on('message', async (message) => {
    try {
        await db.open();

        let height = 0;
        let downloaded_event_latest_height = await db.get(layout.height.encode(1));
        if (downloaded_event_latest_height) {
            height = JSON.parse(downloaded_event_latest_height);
        }

        for (let h = height; h < message.max_height; h++) {

            if (pause) {
                return;
            }
            await db.put(layout.height.encode(1), JSON.stringify(h));
            let eventHashs = await getNeedDownloadBlockEventHashs(h);
            await downloadBlockEvents(eventHashs);
        }

        await db.close();

    } catch (error) {
        console.log(error);
        parentPort.close();
    }
});
