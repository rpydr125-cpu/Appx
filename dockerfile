FROM node:20
RUN apt update && apt install -y ffmpeg
WORKDIR /app
COPY . .
RUN npm install
CMD ["node","bot.js"]
