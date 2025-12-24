import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin as adminPlugin, openAPI } from 'better-auth/plugins';
import { ac, admin, manager, user } from './auth/permissions';
import { resetPasswordTemplate } from './emails/reset-password.template';
import { env } from './env';
import { sendEmail } from './services/email.service';

// Configurar baseURL para produção (necessário para cookies funcionarem corretamente)
// Usar função para evitar problemas com minificação do Bun
function getBaseURL(): string {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://popjoy-api.claudiolins.eu';
  }
  return 'http://localhost:3333';
}
const baseURL = getBaseURL();

export { baseURL };

const isProduction = baseURL.startsWith('https://') || process.env.NODE_ENV === 'production';

console.log('🔐 Better Auth Config:', {
  baseURL,
  basePath: '/api/auth',
  nodeEnv: process.env.NODE_ENV,
  trustedOrigins: ["http://localhost:3000","https://admin.popjoypipocas.com"],
  cookieSameSite: isProduction ? 'none' : 'lax',
  cookieSecure: isProduction,
});

export const auth = betterAuth({
  basePath: '/api/auth',
  baseURL,
  trustedOrigins: ["http://localhost:3000","https://admin.popjoypipocas.com"],
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
    },
    // Em desenvolvimento, desabilitar Secure para funcionar em HTTP (localhost)
    // Em produção, Secure é obrigatório quando sameSite=none
    useSecureCookies: isProduction,
    defaultCookieAttributes: {
      // Para cross-domain (frontend e API em domínios diferentes), precisa ser 'none'
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction, // HTTPS only em produção (obrigatório com sameSite: none)
      httpOnly: true,
      path: '/',
      // Não definir domain para permitir cross-domain
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
      fetch('http://127.0.0.1:7242/ingest/89dfd59f-5051-44a9-a586-4f79967ee771',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:sendResetPassword',message:'URL recebida do Better Auth',data:{originalUrl:url,hasToken:!!token,tokenValue:token,nodeEnv:process.env.NODE_ENV,frontendUrl:env.FRONTEND_URL,requestHost:request?.headers?.get?.('host')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
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
      maxAge: 60 * 5 // 5 minutes
    },
    cookieOptions: {
      // Para cross-domain (frontend e API em domínios diferentes), precisa ser 'none'
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction, // HTTPS only em produção (obrigatório com sameSite: none)
      httpOnly: true,
      path: '/',
      // Não definir domain para permitir cross-domain
    }
  }
});
