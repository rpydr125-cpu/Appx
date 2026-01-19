import os

class Config:
    API_ID = int(os.environ.get("API_ID", "22447622")) # Apna API ID daalein
    API_HASH = os.environ.get("API_HASH", "543b62d58d3e723e766ba57a984ab65d") # Apna API Hash daalein
    BOT_TOKEN = os.environ.get("BOT_TOKEN", "8296583593:AAFdO5i9cj9noPqmeVZl9kbH4nEWWwmI42w") # Apna Bot Token daalein
    PROXY_API = "https://hindibhaskarbyamarnathapi.akamai.net.in/xstream?url="
  
