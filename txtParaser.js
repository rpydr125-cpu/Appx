const fs = require("fs");

function parseTxt(filePath) {
  const data = fs.readFileSync(filePath, "utf-8");
  return data
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.startsWith("http"));
}

module.exports = { parseTxt };
