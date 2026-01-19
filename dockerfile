FROM python:3.9-slim-buster

# Install FFmpeg
RUN apt-get update && apt install -y ffmpeg

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy all files
COPY . .

# Run the bot
CMD ["python3", "bot.py"]

