FROM node:20

RUN apt-get update && apt-get install -y ffmpeg awscli
RUN npm install -g bun

WORKDIR /app

# copy only needed files first
COPY apps/video-processing/package.json ./package.json
COPY apps/video-processing/bun.lockb* ./

RUN bun install

# copy app source
COPY apps/video-processing/ .

RUN bun run build

CMD ["node", "dist/main.js"]
