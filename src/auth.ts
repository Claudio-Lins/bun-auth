import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { passkey } from "@better-auth/passkey";
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin as adminPlugin, openAPI } from 'better-auth/plugins';
import { ac, admin, manager, user } from './auth/permissions';
import { resetPasswordTemplate } from './emails/reset-password.template';
import { env } from './env';
import { sendEmail } from './services/email.service';

// Configurar origens confiáveis para Better Auth
const trustedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [
      "http://localhost:3000",
      "https://admin.popjoypipocas.com",
      "http://localhost:3333",
      "https://popjoy-api.claudiolins.eu"
    ];

export const auth = betterAuth({
  basePath: '/api/auth',
  trustedOrigins,
  plugins: [
    openAPI(),
    adminPlugin({
      ac,
      roles: {
        admin,
        manager,
        user,
      },
      defaultRole: "user",
    }),
    passkey(),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (userData) => {
          // Gerar ID se não existir (generateId está false, mas garantimos o ID aqui para compatibilidade)
          const userId = userData.id || crypto.randomUUID();
          
          // Garantir que o campo role seja sempre "user" na criação
          return {
            data: {
              ...userData,
              id: userId,
              role: userData.role || "user",
            },
          };
        },
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
    schema,
  }),
  advanced: {
    database: {
      generateId: false
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    password: {
      hash: (password: string) => Bun.password.hash(password),
      verify: ({password, hash}) => Bun.password.verify(password, hash),
    },
    sendResetPassword: async ({ user, url, token }, request) => {
      // Determinar URL do frontend baseado no ambiente
      // Detectar ambiente pelo host da requisição (mais confiável que NODE_ENV)
      const requestHost = request?.headers?.get?.('host') || '';
      const isProduction = requestHost.includes('admin.popjoypipocas.com') || 
                          requestHost.includes('popjoypipocas.com') ||
                          (process.env.NODE_ENV === 'production' && !requestHost.includes('localhost'));
      
      // Sempre usar detecção automática para evitar inversão de lógica
      // Se FRONTEND_URL estiver definido incorretamente, será ignorado
      const frontendUrl = isProduction 
        ? 'https://admin.popjoypipocas.com' 
        : 'http://localhost:3000';
      
      // Extrair token da URL original ou usar o token fornecido
      let resetToken = token;
      if (!resetToken && url) {
        // Tentar extrair token da URL (formato: /api/auth/reset-password/TOKEN ou /reset-password/TOKEN)
        const tokenMatch = url.match(/\/reset-password\/([^/?]+)/);
        if (tokenMatch) {
          resetToken = tokenMatch[1];
        }
      }
      
      // Extrair callbackURL da URL original se existir
      let callbackURL = '/auth/reset-password'; // padrão
      if (url) {
        try {
          // Tentar parsear a URL (pode ser relativa ou absoluta)
          const urlObj = url.startsWith('http') 
            ? new URL(url) 
            : new URL(url, 'http://localhost:3333'); // base temporária para parsing
          const callbackParam = urlObj.searchParams.get('callbackURL');
          if (callbackParam) {
            callbackURL = decodeURIComponent(callbackParam);
          }
        } catch (e) {
          // Se falhar o parsing, usar padrão
        }
      }
      
      // Construir nova URL apontando para o frontend
      const resetUrl = `${frontendUrl}${callbackURL}${resetToken ? `?token=${resetToken}` : ''}`;
      
      const html = resetPasswordTemplate(resetUrl);
      await sendEmail({
        to: user.email,
        subject: "Redefinição de senha",
        html,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5 // 30 days
    }
  }
});
