FROM node:20

RUN apt update && apt install -y ffmpeg

WORKDIR /app
COPY package.json .
RUN npm install

COPY . .

CMD ["npm", "start"]
