import type { jsPDF } from 'jspdf';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { isNativeApp } from './platform';

export const sanitizeFilename = (name: string): string => {
  const cleaned = name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 180);
  return cleaned || 'quotation';
};

const dataUriToBase64 = (dataUri: string): string => {
  const comma = dataUri.indexOf(',');
  if (comma < 0) throw new Error('Invalid PDF data');
  return dataUri.slice(comma + 1);
};

export interface PdfSaveResult {
  native: boolean;
  fileUri?: string;
}

export const saveQuotationPdf = async (doc: jsPDF, filename: string): Promise<PdfSaveResult> => {
  const safeName = sanitizeFilename(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);

  if (!isNativeApp()) {
    doc.save(safeName);
    return { native: false };
  }

  const base64 = dataUriToBase64(doc.output('datauristring'));
  await Filesystem.writeFile({
    path: safeName,
    data: base64,
    directory: Directory.Cache,
    recursive: true,
  });

  const { uri } = await Filesystem.getUri({
    path: safeName,
    directory: Directory.Cache,
  });

  const canShare = await Share.canShare();
  if (!canShare.value) {
    throw new Error('Android sharing is unavailable on this device');
  }

  await Share.share({
    title: 'Terrazzo quotation',
    text: `Quotation ${safeName}`,
    files: [uri],
    dialogTitle: 'Share quotation',
  });

  return { native: true, fileUri: uri };
};
