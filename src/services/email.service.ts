import { env } from "../env";
import { resend } from "../lib/resend";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Serviço genérico de envio de email
 * ALTERAÇÃO: abstração para desacoplar Resend da lógica de auth
 */
export async function sendEmail(params: SendEmailParams): Promise<void> {
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}