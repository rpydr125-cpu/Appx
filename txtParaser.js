const fs = require("fs");

function parse(file) {
  const data = fs.readFileSync(file, "utf-8");

  if (file.endsWith(".json")) {
    const arr = JSON.parse(data);
    return Array.isArray(arr) ? arr : [];
  }

  return data
    .split(/\r?\n|,/)
    .map(x => x.trim())
    .filter(x => x.startsWith("http"));
}

module.exports = { parse };
