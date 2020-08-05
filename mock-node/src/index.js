const result = require("dotenv").config()

if (result.error) {
    throw result.error
}

const app = require('./app')
const PORT = process.env.port;

app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}...`);
});
