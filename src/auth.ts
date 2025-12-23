import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin as adminPlugin, openAPI } from 'better-auth/plugins';
import { ac, admin, manager, user } from './auth/permissions';
import { sendEmail } from './services/email.service';
import { resetPasswordTemplate } from './emails/reset-password.template';
import { env } from './env';

export const auth = betterAuth({
  basePath: '/api/auth',
  trustedOrigins: ["http://localhost:3000"],
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
          // Garantir que o campo role seja sempre "user" na criação
          return {
            data: {
              ...userData,
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:sendResetPassword',message:'URL recebida do Better Auth',data:{originalUrl:url,hasToken:!!token,tokenValue:token,nodeEnv:process.env.NODE_ENV,frontendUrl:env.FRONTEND_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Determinar URL do frontend baseado no ambiente
      const frontendUrl = env.FRONTEND_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://admin.popjoypipocas.com' 
          : 'http://localhost:3000');
      
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
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:sendResetPassword',message:'URL construída para frontend',data:{resetUrl,frontendUrl,callbackURL,resetToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
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
