require("dotenv").config();
const { Telegraf } = require("telegraf");
const fs = require("fs");
const path = require("path");
const { parseTxt } = require("./txtParser");
const { downloadM3U8 } = require("./downloader");

const bot = new Telegraf(process.env.BOT_TOKEN);

if (!fs.existsSync("downloads")) fs.mkdirSync("downloads");

bot.start(ctx => ctx.reply("✅ TXT uploader bot ready. Send me a .txt file"));

bot.on("document", async (ctx) => {
  const file = ctx.message.document;

  if (!file.file_name.endsWith(".txt"))
    return ctx.reply("❌ Please send only TXT file");

  const link = await ctx.telegram.getFileLink(file.file_id);
  const res = await fetch(link.href);
  const buffer = await res.arrayBuffer();

  const filePath = path.join(__dirname, file.file_name);
  fs.writeFileSync(filePath, Buffer.from(buffer));

  const links = parseTxt(filePath);
  ctx.reply(`📄 Found ${links.length} links`);

  for (let i = 0; i < links.length; i++) {
    const raw = links[i];
    const proxied = `${process.env.PROXY_URL}/xstream?url=${encodeURIComponent(raw)}`;

    try {
      ctx.reply(`⬇️ Downloading ${i + 1}/${links.length}`);
      const out = await downloadM3U8(proxied, "video_" + Date.now());
      await ctx.replyWithVideo({ source: out });
      fs.unlinkSync(out);
    } catch (e) {
      ctx.reply("⚠️ Failed one link");
    }
  }

  fs.unlinkSync(filePath);
});

bot.launch();
console.log("🤖 Bot started");
