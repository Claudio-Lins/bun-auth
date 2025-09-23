FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY . .

RUN bun build src/index.ts --outdir ./dist --target bun

EXPOSE 3333
CMD ["bun", "run", "dist/index.js"]