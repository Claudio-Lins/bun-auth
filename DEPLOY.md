# 🚀 Deploy no Coolify (Hetzner)

Este guia explica como fazer o deploy da aplicação Bun Auth no Coolify/Hetzner.

## 📋 Pré-requisitos

- Conta na Hetzner Cloud
- Instância do Coolify configurada
- Repositório Git configurado

## 🔧 Configuração no Coolify

### 1. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Coolify:

```bash
# Database
DATABASE_URL=postgresql://username:password@db:5432/auth
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=auth

# Better Auth
BETTER_AUTH_SECRET=your_super_secure_secret_key_here_minimum_32_chars
BETTER_AUTH_URL=https://your-domain.com

# Application
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

### 2. Configuração do Projeto

1. **Tipo**: Docker Compose
2. **Docker Compose File**: `docker-compose.prod.yml`
3. **Build Pack**: Docker
4. **Port**: 3333
5. **Health Check Path**: `/health`

### 3. Configuração de Domínio

- Configure seu domínio para apontar para o servidor
- Configure SSL/TLS automático no Coolify
- Certifique-se de que a variável `BETTER_AUTH_URL` usa o domínio correto

## 🗄️ Banco de Dados

### Executar Migrações

Após o primeiro deploy, execute as migrações:

```bash
# No container da aplicação
bun run db:migrate
```

### Studio do Banco (Desenvolvimento)

Para acessar o Drizzle Studio localmente:

```bash
bun run db:studio
```

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
- `POSTGRES_PASSWORD`: Use uma senha forte
- `DATABASE_URL`: Mantenha em segredo

### CORS

Configure `CORS_ORIGIN` para permitir apenas domínios específicos em produção.

## 🚀 Processo de Deploy

1. **Push para Git**: Faça push das alterações para o repositório
2. **Auto Deploy**: O Coolify fará o deploy automaticamente
3. **Health Check**: Verifique se `/health` retorna status 200
4. **Logs**: Monitore os logs para verificar se não há erros

## 📝 Comandos Úteis

```bash
# Build local
bun run build

# Executar localmente
bun run start

# Executar em modo desenvolvimento
bun run dev

# Verificar health
curl https://your-domain.com/health
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de Conexão com DB**: Verifique `DATABASE_URL`
2. **Erro de CORS**: Configure `CORS_ORIGIN` corretamente
3. **Health Check Falhando**: Verifique se a porta 3333 está acessível

### Logs de Debug

A aplicação registra informações importantes:

```bash
# Ver logs no Coolify
# Ou conectar ao container:
docker exec -it bun-auth-app bun run --help
```

## 📧 Suporte

Para problemas específicos:
1. Verifique os logs no Coolify
2. Confirme as variáveis de ambiente
3. Teste o health check endpoint
