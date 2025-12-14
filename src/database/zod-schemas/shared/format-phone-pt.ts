
export function formatPhonePt(phone: string): string {
  if (!/^\d{9}$/.test(phone)) {
    return phone;
  }

  return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)}`;
}