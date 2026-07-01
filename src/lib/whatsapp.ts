/** Normalize Ugandan phone to E.164 (256XXXXXXXXX). */
export const normalizeUgPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('256')) return digits;
  if (digits.startsWith('0')) return '256' + digits.slice(1);
  if (digits.length === 9) return '256' + digits;
  return digits;
};

export const buildWhatsAppUrl = (phone: string, message: string): string => {
  const p = normalizeUgPhone(phone);
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
};
