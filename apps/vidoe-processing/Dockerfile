FROM node:18

RUN apt-get update && apt-get install -y ffmpeg
RUN npm install -g bun

WORKDIR /app

# flexible copy
COPY package.json bun.lockb* ./

RUN bun install

COPY . .

RUN bun run build

EXPOSE 3010

# CMD ["node", "main.js"]