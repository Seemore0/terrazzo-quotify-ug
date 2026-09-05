import { localDb, newId, nowIso, type LocalQuotation, type LocalSection } from './db';
import { localOwnerId } from './identity';
import { nextLocalQuoteNumber } from './quoteNumberService';
import { recalcLocalCustomerTotals } from './localCustomerService';
import type { SectionInsert } from '@/hooks/useQuotationSections';

export type QuotationPatch = Partial<LocalQuotation>;

const mine = () => localDb.quotations.where('owner_id').equals(localOwnerId());

export const listLocalQuotations = async (filters?: { status?: string; customerId?: string }): Promise<LocalQuotation[]> => {
  let rows = await mine().toArray();
  if (filters?.status) rows = rows.filter(r => r.status === filters.status);
  if (filters?.customerId) rows = rows.filter(r => r.customer_id === filters.customerId);
  return rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
};

export const getLocalQuotation = async (id: string): Promise<LocalQuotation | null> =>
  (await localDb.quotations.get(id)) ?? null;

export const putLocalQuotation = async (row: LocalQuotation): Promise<LocalQuotation> => {
  await localDb.quotations.put(row);
  return row;
};

export const putLocalQuotations = async (rows: LocalQuotation[]) => {
  if (rows.length) await localDb.quotations.bulkPut(rows);
};

export const createLocalQuotation = async (input: Record<string, unknown>): Promise<LocalQuotation> => {
  const ts = nowIso();
  const row = {
    id: newId(),
    owner_id: localOwnerId(),
    quote_number: await nextLocalQuoteNumber(),
    created_at: ts,
    updated_at: ts,
    status: 'draft',
    area_m2: 0,
    subtotal: 0,
    total_cost: 0,
    profit: 0,
    profit_pct: 0,
    transport_cost: 0,
    rate_per_m2: 0,
    has_sections: true,
    materials: null,
    notes: null,
    customer_id: null,
    customer_location: null,
    pattern_id: null,
    style_id: null,
    preset_id: null,
    pdf_url: null,
    ...input,
  } as LocalQuotation;
  await localDb.quotations.put(row);
  if (row.customer_id) await recalcLocalCustomerTotals(row.customer_id);
  return row;
};

export const updateLocalQuotation = async (id: string, patch: QuotationPatch): Promise<LocalQuotation> => {
  const existing = await localDb.quotations.get(id);
  if (!existing) throw new Error('Quotation not found on this device');
  const updated: LocalQuotation = { ...existing, ...patch, updated_at: nowIso() };
  await localDb.quotations.put(updated);
  if (updated.customer_id) await recalcLocalCustomerTotals(updated.customer_id);
  return updated;
};

export const duplicateLocalQuotation = async (id: string): Promise<LocalQuotation> => {
  const src = await localDb.quotations.get(id);
  if (!src) throw new Error('Quotation not found on this device');
  const { id: _id, quote_number: _qn, created_at: _c, updated_at: _u, ...rest } = src;
  const copy = await createLocalQuotation({ ...rest, status: 'draft' });
  const sections = await localDb.sections.where('quote_id').equals(id).toArray();
  if (sections.length) {
    await localDb.sections.bulkPut(sections.map(s => ({ ...s, id: newId(), quote_id: copy.id })));
  }
  return copy;
};

export const deleteLocalQuotation = async (id: string) => {
  const row = await localDb.quotations.get(id);
  await localDb.sections.where('quote_id').equals(id).delete();
  await localDb.quotations.delete(id);
  if (row?.customer_id) await recalcLocalCustomerTotals(row.customer_id);
};

/* ---------- sections ---------- */

export const listLocalSections = async (quoteId: string): Promise<LocalSection[]> => {
  const rows = await localDb.sections.where('quote_id').equals(quoteId).toArray();
  return rows.sort((a, b) => a.sort - b.sort);
};

export const putLocalSections = async (rows: LocalSection[]) => {
  if (rows.length) await localDb.sections.bulkPut(rows);
};

export const replaceLocalSections = async (quoteId: string, sections: SectionInsert[]): Promise<LocalSection[]> => {
  const owner_id = localOwnerId();
  await localDb.sections.where('quote_id').equals(quoteId).delete();
  const rows: LocalSection[] = sections.map(s => ({ ...s, id: newId(), quote_id: quoteId, owner_id }));
  if (rows.length) await localDb.sections.bulkPut(rows);
  return rows;
};
