import { z } from "zod";

export const postalCodeSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  // 🔴 ALTERAÇÃO:
  // Remove tudo que não for número
  const digits = value.replace(/\D/g, "");

  // Se tiver exatamente 7 dígitos, formata para ####-###
  if (digits.length === 7) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return value;
},
z.string().regex(/^\d{4}-\d{3}$/, "Código postal inválido (formato ####-###)")
);