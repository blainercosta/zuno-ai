export const SUPPORT_WHATSAPP_NUMBER = import.meta.env.VITE_SUPPORT_WHATSAPP ?? '5511918492120';

export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
