import { db } from '@/database/client';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';

export const auth = betterAuth({
  basePath: '/api/auth',
  trustedOrigins: ["*"],
  plugins: [openAPI()],
    database: drizzleAdapter(db, {
      provider: 'pg',
      usePlural: true,
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
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5 // 30 days
    }
  }
});
