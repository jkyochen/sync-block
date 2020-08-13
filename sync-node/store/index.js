const bdb = require('bdb');
const db = bdb.create('blockchain.db');

/*
 * Database Layout:
 *   h[type] -> (downloaded_block_latest_height, downloaded_event_latest_height, latest_heitht) height
 *   b[type][hash] -> (downloaded/validated)block header
 *   e[type][hash] -> (downloaded/validated)block event
 *   l[type][height] -> (wait download/downloaded/validated) block event hash list
 */

const layout = {
    height: bdb.key("h", ['uint32']),
    block: bdb.key('b', ['uint32', 'hash256']),
    event: bdb.key('e', ['uint32', 'hash256']),
    list: bdb.key('l', ['uint32', 'uint32']),
}

module.exports = {
    db,
    layout,
}
