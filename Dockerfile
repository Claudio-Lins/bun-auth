# =========================
# BUILD STAGE
# =========================
FROM --platform=linux/amd64 oven/bun:1.1.26 AS build

WORKDIR /app

# Copia apenas arquivos de dependências (cache eficiente)
COPY package.json .
COPY bun.lockb* ./

RUN bun install --frozen-lockfile
# ▲ MUDANÇA: garante build reprodutível

# Copia o restante do projeto
COPY ./src ./src
COPY ./build.ts ./build.ts
COPY ./tsconfig.json ./tsconfig.json

RUN bun build.ts \
 && chmod +x /app/build/server

# =========================
# RUNTIME STAGE
# =========================
FROM --platform=linux/amd64 debian:bookworm-slim

WORKDIR /app

# Instalar dependências mínimas necessárias para executar binários compilados
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/build/server ./server

ENV NODE_ENV=production
EXPOSE 3333

CMD ["./server"]