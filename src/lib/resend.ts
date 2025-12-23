import { Resend } from "resend";
import { env } from "../env";

/**
 * Configuração central do Resend
 * ALTERAÇÃO: criação de client único reutilizável
 */
export const resend = new Resend(env.RESEND_API_KEY);