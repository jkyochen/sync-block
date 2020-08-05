const { db, layout } = require('../store');

async function executeValidateBlockEvent(hash) {

    let waitValidateBlockEvent = await db.get(layout.event.encode(0, hash));
    waitValidateBlockEvent = JSON.parse(waitValidateBlockEvent);
}

(async function () {
    await executeValidateBlockEvent();
})()
