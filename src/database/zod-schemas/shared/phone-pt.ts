import { z } from "zod";

export const phonePtSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  // 🔴 ALTERAÇÃO:
  // Remove tudo que não for número
  const digits = value.replace(/\D/g, "");

  return digits;
},
z
  .string()
  .regex(/^\d{9}$/, "Telefone português deve conter 9 dígitos")
);