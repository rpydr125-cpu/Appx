const fs = require("fs");

function logFail(link) {
  fs.appendFileSync("./data/failed.txt", link + "\n");
}

module.exports = { logFail };

