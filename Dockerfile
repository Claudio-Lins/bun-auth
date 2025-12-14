# =========================
# BUILD STAGE
# =========================
FROM --platform=linux/amd64 oven/bun:1.1.26 AS build

WORKDIR /app

# Copia apenas arquivos de dependências (cache eficiente)
COPY package.json .
COPY bun.lockb* ./

RUN bun install --frozen-lockfile --production=false

# Copia o restante do projeto
COPY ./src ./src
COPY ./tsconfig.json ./tsconfig.json

# =========================
# RUNTIME STAGE
# =========================
FROM --platform=linux/amd64 oven/bun:1.1.26

WORKDIR /app

# Copiar apenas dependências de produção
COPY package.json .
COPY bun.lockb* ./

RUN bun install --frozen-lockfile --production

# Copiar código fonte
COPY --from=build /app/src ./src
COPY --from=build /app/tsconfig.json ./tsconfig.json

ENV NODE_ENV=production
EXPOSE 3333

CMD ["bun", "run", "src/index.ts"]