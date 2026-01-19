const fs = require("fs");
const FILE = "./data/queue.json";

function loadQueue() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

function saveQueue(queue) {
  fs.writeFileSync(FILE, JSON.stringify(queue, null, 2));
}

module.exports = { loadQueue, saveQueue };

