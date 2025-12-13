import { createAccessControl } from "better-auth/plugins/access";

/**
 * Define os recursos e ações disponíveis no sistema
 */
export const statement = {
  product: ["create", "read", "update", "delete"],
  variant: ["create", "read", "update", "delete"],
  batch: ["create", "read", "update", "delete", "sell"],
  unit: ["create", "read", "update", "delete"],
  user: ["read", "update", "delete"],
} as const;

/**
 * Cria o controlador de acesso
 */
export const ac = createAccessControl(statement);

/**
 * Role: USER
 * Permissões básicas de leitura
 */
export const user = ac.newRole({
  product: ["read"],
  variant: ["read"],
  batch: ["read"],
  unit: ["read"],
});

/**
 * Role: MANAGER
 * Permissões completas de gerenciamento (CRUD completo)
 */
export const manager = ac.newRole({
  product: ["create", "read", "update", "delete"],
  variant: ["create", "read", "update", "delete"],
  batch: ["create", "read", "update", "delete", "sell"],
  unit: ["create", "read", "update", "delete"],
  user: ["read"],
});

/**
 * Role: ADMIN
 * Permissões totais incluindo gerenciamento de usuários
 */
export const admin = ac.newRole({
  product: ["create", "read", "update", "delete"],
  variant: ["create", "read", "update", "delete"],
  batch: ["create", "read", "update", "delete", "sell"],
  unit: ["create", "read", "update", "delete"],
  user: ["read", "update", "delete"],
});

