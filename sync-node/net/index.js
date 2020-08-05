const got = require('got');
const NODE_ADDRESS = "http://127.0.0.1:3000";

async function get(route) {
    try {
        const response = await got(`${NODE_ADDRESS}${route}`, {
            responseType: 'json'
        });
        return response.body;
    } catch (error) {
        console.log(error.response.body);
    }
}

module.exports = {
    getVersion: async () => {
        return await get("/version");
    },
    getBlockHeaderByHeight: async (height) => {
        return await get(`/blockheader/${height}`);
    },
    getBlockEventsByHeight: async (height) => {
        return await get(`/blockevents/${height}`);
    },
    getBlockEventByHash: async (hash) => {
        return await get(`/blockevent/${hash}`);
    },
}
