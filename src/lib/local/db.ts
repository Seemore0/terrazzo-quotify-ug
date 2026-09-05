import Dexie, { type Table } from 'dexie';
import type { Database } from '@/integrations/supabase/types';
import type { QuotationSection } from '@/hooks/useQuotationSections';
import type { MixPreset } from '@/hooks/useMixPresets';
import type { Preset } from '@/lib/presetTypes';

export type LocalCustomer = Database['public']['Tables']['customers']['Row'];
export type LocalQuotation = Database['public']['Tables']['quotations']['Row'];
export type LocalSection = QuotationSection;
export type LocalMixPreset = MixPreset;
export type LocalPricingPreset = Preset & { owner_id: string | null };

export interface LocalCounter {
  /** `${ownerId}:${yymmdd}` */
  key: string;
  last_seq: number;
}

export interface LocalSetting {
  /** `${ownerId}:${name}` */
  key: string;
  owner_id: string;
  name: string;
  value: unknown;
  updated_at: string;
}

export interface SyncQueueItem {
  id?: number;
  owner_id: string;
  entity: 'customer' | 'quotation' | 'section' | 'mix_preset' | 'pricing_preset';
  op: 'upsert' | 'delete';
  payload: unknown;
  created_at: string;
}

class TerrazzoLocalDB extends Dexie {
  customers!: Table<LocalCustomer, string>;
  quotations!: Table<LocalQuotation, string>;
  sections!: Table<LocalSection, string>;
  mixPresets!: Table<LocalMixPreset, string>;
  pricingPresets!: Table<LocalPricingPreset, string>;
  counters!: Table<LocalCounter, string>;
  settings!: Table<LocalSetting, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('terrazzo-offline');
    this.version(1).stores({
      customers: 'id, owner_id, phone, name, archived, updated_at',
      quotations: 'id, owner_id, customer_id, status, quote_number, created_at, updated_at',
      sections: 'id, quote_id, owner_id, kind, sort',
      mixPresets: 'id, owner_id, kind, name, is_builtin',
      pricingPresets: 'id, owner_id, name, is_public',
      counters: 'key',
      settings: 'key, owner_id, name',
      syncQueue: '++id, owner_id, entity, created_at',
    });
  }
}

export const localDb = new TerrazzoLocalDB();

export const nowIso = () => new Date().toISOString();

export const newId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `loc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};
