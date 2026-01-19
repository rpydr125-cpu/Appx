FROM python:3.9-slim-buster

# FFmpeg install karein
RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

# Bot run karein
CMD ["python3", "bot.py"]
