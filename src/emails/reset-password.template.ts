export function resetPasswordTemplate(resetLink: string): string {
  // Usar concatenação ao invés de template string para evitar problemas com minificação
  return (
    '<h1>Redefinição de senha</h1>' +
    '<p>Você solicitou a redefinição da sua senha.</p>' +
    '<p>' +
    '<a href="' + resetLink + '">' +
    'Clique aqui para redefinir sua senha' +
    '</a>' +
    '</p>' +
    '<p>Se não foi você, ignore este email.</p>'
  );
}