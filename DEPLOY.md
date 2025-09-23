# 🚀 Deploy no Coolify (Hetzner) - API com Banco Externo

Este guia explica como fazer o deploy da aplicação Bun Auth no Coolify/Hetzner usando um banco de dados externo.

## 📋 Pré-requisitos

- Conta na Hetzner Cloud
- Instância do Coolify configurada
- Repositório Git configurado
- **Banco de dados externo** (Supabase, Neon, Railway, PlanetScale, etc.)

## 🗄️ Configuração do Banco de Dados Externo

### Opções Recomendadas:

1. **Supabase** (PostgreSQL managed)
2. **Neon** (PostgreSQL serverless)
3. **Railway** (PostgreSQL + outros serviços)
4. **PlanetScale** (MySQL serverless)

### Executar Migrações

Após configurar o banco externo, execute as migrações localmente:

```bash
# Configure o DATABASE_URL no .env local
DATABASE_URL=postgresql://user:pass@host:port/db

# Execute as migrações
bun run db:migrate
```

## 🔧 Configuração no Coolify

### 1. Criar Novo Projeto

1. **Tipo**: GitHub Repository
2. **Source**: Conecte seu repositório do GitHub
3. **Build Pack**: Docker
4. **Port**: 3333
5. **Health Check Path**: `/health`

### 2. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Coolify:

```bash
# Database Externo
DATABASE_URL=postgresql://user:password@external-host:port/database

# Better Auth
BETTER_AUTH_SECRET=your_super_secure_secret_key_minimum_32_characters
BETTER_AUTH_URL=https://sua-api-domain.com

# Application
NODE_ENV=production
CORS_ORIGIN=https://seu-frontend-domain.com
```

### 3. Configuração de Deploy

- **Dockerfile Path**: `./Dockerfile`
- **Docker Compose**: Não necessário (apenas API)
- **Auto Deploy**: Ative para deploy automático via Git push

### 4. Configuração de Domínio

- Configure seu domínio personalizado
- SSL/TLS automático será configurado pelo Coolify
- Atualize `BETTER_AUTH_URL` com o domínio final

## 📊 Monitoramento

### Health Check

A aplicação expõe um endpoint de health check em `/health`:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### Logs

- Monitore os logs através do painel do Coolify
- A aplicação usa `JSON.stringify` para logs estruturados

## 🔒 Segurança

### Variáveis Importantes

- `BETTER_AUTH_SECRET`: Deve ter pelo menos 32 caracteres
- `DATABASE_URL`: Mantenha em segredo (banco externo)

### CORS

Configure `CORS_ORIGIN` para permitir apenas domínios específicos em produção.

## 🚀 Processo de Deploy

1. **Configurar Banco Externo**: Configure seu banco de dados externo primeiro
2. **Executar Migrações**: Execute `bun run db:migrate` localmente
3. **Push para GitHub**: Faça push das alterações para o repositório
4. **Configurar Coolify**: Crie projeto no Coolify conectado ao GitHub
5. **Configurar Variáveis**: Adicione as variáveis de ambiente no Coolify
6. **Deploy Automático**: O Coolify fará o deploy automaticamente
7. **Verificar Health**: Confirme se `/health` retorna status 200

## 📝 Comandos Úteis

```bash
# Build local
bun run build

# Executar localmente
bun run start

# Executar em modo desenvolvimento
bun run dev

# Executar migrações (localmente)
bun run db:migrate

# Verificar health
curl https://sua-api-domain.com/health
```

## 🗄️ Provedores de Banco Recomendados

### Supabase (Recomendado)
```bash
DATABASE_URL=postgresql://postgres:senha@db.xxx.supabase.co:5432/postgres
```

### Neon
```bash
DATABASE_URL=postgresql://user:senha@ep-xxx.region.neon.tech/dbname
```

### Railway
```bash
DATABASE_URL=postgresql://postgres:senha@containers-us-west-xxx.railway.app:6543/railway
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de Conexão com DB Externo**: 
   - Verifique se o `DATABASE_URL` está correto
   - Confirme se o banco permite conexões externas
   - Verifique se as migrações foram executadas

2. **Erro de CORS**: Configure `CORS_ORIGIN` corretamente

3. **Health Check Falhando**: 
   - Verifique se a porta 3333 está acessível
   - Confirme se todas as variáveis estão configuradas

### Logs de Debug

A aplicação registra informações importantes:

```bash
# Ver logs no Coolify dashboard
# Todos os logs aparecem em tempo real
```

## 📧 Suporte

Para problemas específicos:
1. Verifique os logs no painel do Coolify
2. Confirme as variáveis de ambiente
3. Teste o health check endpoint
4. Verifique a conectividade com o banco externo
