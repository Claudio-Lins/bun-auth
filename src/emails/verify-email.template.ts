export function verifyEmailTemplate(verifyLink: string): string {
  return `
    <h1>Verificação de email</h1>
    <p>Confirme seu email para ativar sua conta.</p>
    <p>
      <a href="${verifyLink}">
        Verificar email
      </a>
    </p>
  `;
}