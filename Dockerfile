# =========================
# BUILD STAGE
# =========================
FROM oven/bun:1.1.26 AS build

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

RUN bun build.ts && chmod +x /app/server

# =========================
# RUNTIME STAGE
# =========================
FROM gcr.io/distroless/base-debian12
# ▲ MUDANÇA: versão explícita (mais previsível)

WORKDIR /app

COPY --from=build /app/server ./server

ENV NODE_ENV=production
EXPOSE 3333

CMD ["./server"]