import { localDb, nowIso } from './db';
import { localOwnerId } from './identity';

export interface CompanySettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  /** Base64 data URI so PDFs never need the network. */
  logoDataUrl: string | null;
  currency: string;
  quotePrefix: string;
  pdfFooter: string;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'Terrazzo Quotation Pro',
  address: '',
  phone: '',
  email: '',
  logoDataUrl: null,
  currency: 'UGX',
  quotePrefix: 'QT',
  pdfFooter: 'Valid for 14 days.',
};

const keyFor = (name: string) => `${localOwnerId()}:${name}`;

export const getLocalSetting = async <T>(name: string, fallback: T): Promise<T> => {
  try {
    const row = await localDb.settings.get(keyFor(name));
    return (row?.value as T) ?? fallback;
  } catch {
    return fallback;
  }
};

export const setLocalSetting = async (name: string, value: unknown): Promise<void> => {
  const owner_id = localOwnerId();
  await localDb.settings.put({ key: keyFor(name), owner_id, name, value, updated_at: nowIso() });
};

export const getCompanySettings = () =>
  getLocalSetting<CompanySettings>('company', DEFAULT_COMPANY_SETTINGS);

export const saveCompanySettings = (settings: CompanySettings) =>
  setLocalSetting('company', settings);
