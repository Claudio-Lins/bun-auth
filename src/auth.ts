import { db } from '@/database/client';
import { schema } from '@/database/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin as adminPlugin, openAPI } from 'better-auth/plugins';
import { ac, admin, manager, user } from './auth/permissions';

export const auth = betterAuth({
  basePath: '/api/auth',
  trustedOrigins: ["*"],
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
