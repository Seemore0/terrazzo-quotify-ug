import { Clipboard } from '@capacitor/clipboard';
import { isNativeApp } from './platform';

const legacyCopy = (text: string): boolean => {
  if (typeof document === 'undefined') return false;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
  return copied;
};

export const copyToClipboard = async (text: string): Promise<void> => {
  if (!text) throw new Error('Nothing to copy');

  if (isNativeApp()) {
    try {
      await Clipboard.write({ string: text, label: 'Terrazzo quotation' });
      return;
    } catch (error) {
      console.warn('[clipboard] Native clipboard failed, trying browser fallback', error);
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      console.warn('[clipboard] Navigator clipboard failed, trying legacy fallback', error);
    }
  }

  if (!legacyCopy(text)) {
    throw new Error('Clipboard access is unavailable');
  }
};
