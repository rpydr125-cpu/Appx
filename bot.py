import os
import time
import asyncio
import subprocess
from pyrogram import Client, filters
from pyrogram.types import Message
from config import Config

bot = Client("2gb_uploader", api_id=Config.API_ID, api_hash=Config.API_HASH, bot_token=Config.BOT_TOKEN)

# --- Helper Functions ---

def humanbytes(size):
    if not size: return "0 B"
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0: return f"{size:.2f} {unit}"
        size /= 1024.0

async def progress_func(current, total, text, message, start_time):
    now = time.time()
    diff = now - start_time
    if round(diff % 4.00) == 0 or current == total:
        percentage = current * 100 / total
        speed = current / diff
        elapsed_time = round(diff)
        eta = round((total - current) / speed) if speed > 0 else 0
        
        progress = "[{0}{1}] {2}%".format(
            '🟢' * int(percentage / 10),
            '⚪' * (10 - int(percentage / 10)),
            round(percentage, 2)
        )
        
        tmp = f"**{text}**\n\n" \
              f"{progress}\n" \
              f"⚡ **Speed:** {humanbytes(speed)}/s\n" \
              f"📦 **Done:** {humanbytes(current)} / {humanbytes(total)}\n" \
              f"⏳ **ETA:** {eta}s"
        try:
            await message.edit(tmp)
        except:
            pass

# --- Bot Commands ---

@bot.on_message(filters.command("start"))
async def start(client, message):
    await message.reply_text("👋 **Main Text-to-Video Uploader Bot hoon!**\n\nBas ek `.txt` file bhejein jisme m3u8 links hon. Main 2GB tak support karta hoon.")

@bot.on_message(filters.document)
async def handle_document(client, message: Message):
    if not message.document.file_name.endswith(".txt"):
        return

    status = await message.reply_text("📥 **File download kar raha hoon...**")
    txt_path = await message.download()
    
    with open(txt_path, "r") as f:
        links = [line.strip() for line in f.readlines() if line.startswith("http")]

    if not links:
        await status.edit("❌ File mein koi valid links nahi mile.")
        return

    for i, link in enumerate(links):
        await status.edit(f"⏳ **Processing Link {i+1}/{len(links)}**\n`{link}`")
        
        # Proxied URL
        final_url = f"{Config.PROXY_API}{link}"
        output_file = f"video_{int(time.time())}.mp4"
        thumb_path = f"thumb_{int(time.time())}.jpg"

        # 1. FFmpeg Download (Fast Copy)
        await status.edit(f"📥 **Downloading Video {i+1}...**\n(Ye server speed par depend karta hai)")
        cmd = [
            "ffmpeg", "-i", final_url, "-c", "copy", 
            "-bsf:a", "aac_adtstoasc", output_file, "-y"
        ]
        process = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        if os.path.exists(output_file):
            # 2. Generate Thumbnail (First Frame)
            subprocess.run(["ffmpeg", "-i", output_file, "-ss", "00:00:01", "-vframes", "1", thumb_path, "-y"])
            
            # 3. Upload with Progress Bar
            start_time = time.time()
            try:
                await client.send_video(
                    chat_id=message.chat.id,
                    video=output_file,
                    thumb=thumb_path if os.path.exists(thumb_path) else None,
                    caption=f"✅ **Title:** Video_{i+1}\n🔗 **Original:** `{link}`",
                    supports_streaming=True,
                    progress=progress_func,
                    progress_args=(f"📤 Uploading Video {i+1}...", status, start_time)
                )
            except Exception as e:
                await message.reply_text(f"❌ Upload Error: {str(e)}")
            
            # Cleanup
            if os.path.exists(output_file): os.remove(output_file)
            if os.path.exists(thumb_path): os.remove(thumb_path)
        else:
            await message.reply_text(f"❌ Failed to download Link {i+1}")

    os.remove(txt_path)
    await status.delete()

print("Bot is running...")
bot.run()

