require("dotenv").config();

const { chai, app, knex } = require(".");

describe("test mock node", () => {
    beforeAll(async () => {
        await knex.migrate.rollback();
        await knex.migrate.latest();
        await knex.seed.run();
    });

    afterAll(async () => {
        await knex.migrate.rollback();
    });

    describe("GET /version", () => {
        test("Should return version and start_height", async () => {
            const res = await chai.request(app).get("/version");
            expect(res.status).toEqual(200);
            expect(res.body.version).toEqual(2);
            expect(res.body.max_height).toEqual(
                parseInt(process.env.blockHeight)
            );
        });
    });

    describe("GET /blockheader/:height", () => {
        test("Should return block header", async () => {
            let height = 10;
            const res = await chai.request(app).get(`/blockheader/${height}`);
            expect(res.status).toEqual(200);
            expect(res.body.blockHeader.height).toEqual(height);
        });
    });

    describe("GET /blockevents/:height", () => {
        test("Should return block all event hash", async () => {
            let height = 10;
            const res = await chai.request(app).get(`/blockevents/${height}`);
            expect(res.status).toEqual(200);
            expect(res.body.eventHashs.length).toBeGreaterThan(0);
        });
    });

    describe("GET /blockevent/:hash", () => {
        test("Should return block event", async () => {
            let height = 10;
            let res = await chai.request(app).get(`/blockevents/${height}`);
            res = await chai
                .request(app)
                .get(`/blockevent/${res.body.eventHashs[0]}`);

            expect(res.status).toEqual(200);
            expect(res.body.event.height).toEqual(height);
        });
    });
});
