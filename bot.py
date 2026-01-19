import os
import time
import subprocess
from flask import Flask
from threading import Thread
from pyrogram import Client, filters
from config import Config

# Render Port Requirement ke liye Flask Setup
app = Flask(__name__)
@app.route('/')
def health_check():
    return "Bot is alive!"

def run_flask():
    app.run(host='0.0.0.0', port=10000)

bot = Client("2gb_uploader", api_id=Config.API_ID, api_hash=Config.API_HASH, bot_token=Config.BOT_TOKEN)

def humanbytes(size):
    if not size: return "0 B"
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0: return f"{size:.2f} {unit}"
        size /= 1024.0

async def progress_func(current, total, text, message, start_time):
    now = time.time()
    diff = now - start_time
    if round(diff % 5.00) == 0 or current == total:
        percentage = current * 100 / total
        speed = current / diff if diff > 0 else 0
        progress = "[{0}{1}] {2}%".format('🟢' * int(percentage / 10), '⚪' * (10 - int(percentage / 10)), round(percentage, 2))
        tmp = f"**{text}**\n\n{progress}\n⚡ **Speed:** {humanbytes(speed)}/s\n📦 **Done:** {humanbytes(current)} / {humanbytes(total)}"
        try: await message.edit(tmp)
        except: pass

@bot.on_message(filters.command("start"))
async def start(client, message):
    await message.reply_text("✅ **Bot Online!**\nSend me a `.txt` file containing m3u8 links.")

@bot.on_message(filters.document)
async def handle_document(client, message):
    if not message.document.file_name.endswith(".txt"):
        return

    status = await message.reply_text("📥 Downloading text file...")
    txt_path = await message.download()
    
    with open(txt_path, "r") as f:
        links = [line.strip() for line in f.readlines() if "http" in line]

    for i, link in enumerate(links):
        await status.edit(f"⏳ **Processing {i+1}/{len(links)}**")
        
        final_url = f"{Config.PROXY_API}{link}"
        output_file = f"video_{i}.mp4"

        # FFmpeg Download
        cmd = ["ffmpeg", "-i", final_url, "-c", "copy", "-bsf:a", "aac_adtstoasc", output_file, "-y"]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        if os.path.exists(output_file):
            start_time = time.time()
            try:
                await client.send_video(
                    chat_id=message.chat.id,
                    video=output_file,
                    caption=f"✅ **Video {i+1}**\n🔗 `{link}`",
                    supports_streaming=True,
                    progress=progress_func,
                    progress_args=(f"📤 Uploading {i+1}...", status, start_time)
                )
            except Exception as e:
                await message.reply_text(f"❌ Error: {e}")
            os.remove(output_file) # Space bachane ke liye turant delete
        else:
            await message.reply_text(f"❌ Failed to download link {i+1}")

    os.remove(txt_path)
    await status.delete()

if __name__ == "__main__":
    Thread(target=run_flask).start() # Flask background mein chalega
    bot.run()
