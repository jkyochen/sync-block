const sha256 = require("bcrypto/lib/sha256");

function sha256ToString(o) {
    return sha256.digest(Buffer.from(JSON.stringify(o))).toString("hex");
}

module.exports = {
    sha256ToString,
}
