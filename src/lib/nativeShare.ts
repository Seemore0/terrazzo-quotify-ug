import { AppLauncher } from '@capacitor/app-launcher';
import { Browser } from '@capacitor/browser';
import { isAndroid, isNativeApp } from './platform';
import { buildWhatsAppUrl, normalizeUgPhone } from './whatsapp';

export const openWhatsApp = async (phone: string, message: string): Promise<'native' | 'browser'> => {
  const normalized = normalizeUgPhone(phone);
  if (!normalized) throw new Error('Invalid phone number');

  const webUrl = buildWhatsAppUrl(normalized, message);
  if (!isNativeApp()) {
    window.open(webUrl, '_blank', 'noopener,noreferrer');
    return 'browser';
  }

  if (isAndroid()) {
    const appUrl = `whatsapp://send?phone=${normalized}&text=${encodeURIComponent(message)}`;
    try {
      const available = await AppLauncher.canOpenUrl({ url: 'whatsapp://send' });
      if (available.value) {
        const result = await AppLauncher.openUrl({ url: appUrl });
        if (result.completed) return 'native';
      }
    } catch (error) {
      console.warn('[whatsapp] Native WhatsApp launch failed, falling back to web URL', error);
    }
  }

  try {
    await Browser.open({ url: webUrl, windowName: '_blank' });
    return 'browser';
  } catch (error) {
    console.warn('[whatsapp] Capacitor Browser failed', error);
    window.location.href = webUrl;
    return 'browser';
  }
};
