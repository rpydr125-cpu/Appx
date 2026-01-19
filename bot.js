require("dotenv").config();
const { Telegraf } = require("telegraf");
const fs = require("fs");
const path = require("path");
const fetch = (...a) => import("node-fetch").then(({default:f})=>f(...a));

const { isAdmin, safeEdit } = require("./utils");
const { parse } = require("./core/parser");
const { loadQueue, saveQueue } = require("./core/queue");
const { download } = require("./core/downloader");
const { detectQuality } = require("./core/quality");
const { makeName } = require("./core/namer");
const { logFail } = require("./core/logger");

if (!fs.existsSync("downloads")) fs.mkdirSync("downloads");
if (!fs.existsSync("data")) fs.mkdirSync("data");

const bot = new Telegraf(process.env.BOT_TOKEN);

let QUEUE = loadQueue();
let running = false;
let stopped = false;

async function worker(ctx) {
  if (running) return;
  running = true;
  stopped = false;

  let status = await ctx.reply("🚀 Queue started");

  while (QUEUE.length && !stopped) {
    const item = QUEUE[0];
    const q = detectQuality(item.url);
    status = await safeEdit(ctx, status, `⬇️ Processing left: ${QUEUE.length}\nQuality: ${q}`);

    try {
      const proxied = `${process.env.PROXY_URL}/xstream?url=${encodeURIComponent(item.url)}`;
      const name = makeName(item.index, q);
      const out = await download(proxied, name);
      await ctx.replyWithVideo({ source: out }, { caption: `🎬 ${name}` });
      fs.unlinkSync(out);
    } catch {
      logFail(item.url);
      await ctx.reply("⚠️ Failed one link (logged)");
    }

    QUEUE.shift();
    saveQueue(QUEUE);
  }

  running = false;
  await ctx.reply(stopped ? "⏹ Queue stopped" : "✅ Queue finished");
}

bot.start(ctx => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Admin only");
  ctx.reply("😈 ULTRA TXT uploader ready\nCommands:\n/status\n/stop\n/resume\nSend TXT/CSV/JSON file");
});

bot.command("status", ctx => {
  if (!isAdmin(ctx)) return;
  ctx.reply(`📊 Queue: ${QUEUE.length}\nRunning: ${running}`);
});

bot.command("stop", ctx => {
  if (!isAdmin(ctx)) return;
  stopped = true;
  ctx.reply("⏹ Stop signal sent");
});

bot.command("resume", ctx => {
  if (!isAdmin(ctx)) return;
  worker(ctx);
});

bot.on("document", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("⛔ Access denied");

  const file = ctx.message.document;
  const link = await ctx.telegram.getFileLink(file.file_id);
  const res = await fetch(link.href);
  const buf = await res.arrayBuffer();

  const filePath = path.join(__dirname, file.file_name);
  fs.writeFileSync(filePath, Buffer.from(buf));

  const links = parse(filePath);
  fs.unlinkSync(filePath);

  const startIndex = QUEUE.length;
  links.forEach((url, i) => QUEUE.push({ url, index: startIndex + i + 1 }));

  saveQueue(QUEUE);
  ctx.reply(`📥 Added ${links.length} links to queue`);

  worker(ctx);
});

bot.launch();
console.log("🤖 ULTRA bot running");
