FROM oven/bun:latest AS build

WORKDIR /app

# Copia só arquivos de dependências primeiro (melhora cache no build)
COPY package.json .
COPY bun.lockb* ./

# Instala dependências (se não existir bun.lockb, ele ignora por causa do "*")
RUN bun install

# Copia o restante do projeto
COPY ./src ./src
COPY ./build.ts ./build.ts
COPY ./tsconfig.json ./tsconfig.json
RUN bun build.ts

# RUNTIME
FROM gcr.io/distroless/base
WORKDIR /app
COPY --from=build /app/build/server server
ENV NODE_ENV=production
EXPOSE 3333
CMD ["./server"]