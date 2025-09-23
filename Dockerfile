FROM oven/bun:latest AS base

WORKDIR /app

# Copia só arquivos de dependências primeiro (melhora cache no build)
COPY package.json bun.lockb* ./

# Instala dependências (se não existir bun.lockb, ele ignora por causa do "*")
RUN bun install --production

# Copia o restante do projeto
COPY . .

# Compila o projeto (ajuste se usar outra estrutura)
RUN bun build src/index.ts --outdir ./dist --target bun

# Expõe a porta padrão (Coolify usa 3000 se não especificar outra)
EXPOSE 3000

# Inicia a aplicação
CMD ["bun", "run", "dist/index.js"]