const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const app = require("../src/app");
const knex = require("../src/db/config");

module.exports = { chai, app, knex };