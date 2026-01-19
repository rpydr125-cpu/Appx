import os

class Config:
    API_ID = int(os.environ.get("API_ID", "12345")) # Apna API ID daalein
    API_HASH = os.environ.get("API_HASH", "your_hash") # Apna API Hash daalein
    BOT_TOKEN = os.environ.get("BOT_TOKEN", "your_token") # Apna Bot Token daalein
    PROXY_API = "https://hindibhaskarbyamarnathapi.akamai.net.in/xstream?url="
  
