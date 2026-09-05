import { localDb, newId, nowIso, type LocalCustomer } from './db';
import { localOwnerId } from './identity';

export interface CustomerInput {
  name: string;
  phone: string;
  email?: string | null;
  location?: string | null;
  notes?: string | null;
}

const mine = () => localDb.customers.where('owner_id').equals(localOwnerId());

export const listLocalCustomers = async (): Promise<LocalCustomer[]> => {
  const rows = await mine().toArray();
  return rows.filter(r => !r.archived).sort((a, b) => a.name.localeCompare(b.name));
};

export const getLocalCustomer = async (id: string): Promise<LocalCustomer | null> =>
  (await localDb.customers.get(id)) ?? null;

export const putLocalCustomer = async (row: LocalCustomer): Promise<LocalCustomer> => {
  await localDb.customers.put(row);
  return row;
};

export const putLocalCustomers = async (rows: LocalCustomer[]) => {
  if (rows.length) await localDb.customers.bulkPut(rows);
};

/** Create or update by phone within the current owner (mirrors the cloud behaviour). */
export const upsertLocalCustomer = async (input: CustomerInput): Promise<LocalCustomer> => {
  const owner_id = localOwnerId();
  const existing = (await mine().toArray()).find(c => c.phone === input.phone);
  const ts = nowIso();

  if (existing) {
    const updated: LocalCustomer = {
      ...existing,
      name: input.name,
      email: input.email ?? existing.email,
      location: input.location ?? existing.location,
      notes: input.notes ?? existing.notes,
      updated_at: ts,
    };
    await localDb.customers.put(updated);
    return updated;
  }

  const created: LocalCustomer = {
    id: newId(),
    owner_id,
    name: input.name,
    phone: input.phone,
    email: input.email ?? null,
    location: input.location ?? null,
    notes: input.notes ?? null,
    archived: false,
    last_project_date: null,
    total_projects: 0,
    total_spent: 0,
    created_at: ts,
    updated_at: ts,
  };
  await localDb.customers.put(created);
  return created;
};

export const archiveLocalCustomer = async (id: string) => {
  const row = await localDb.customers.get(id);
  if (row) await localDb.customers.put({ ...row, archived: true, updated_at: nowIso() });
};

export const deleteLocalCustomer = async (id: string) => {
  await localDb.customers.delete(id);
};

/** Keeps the totals shown on customer cards correct without any server trigger. */
export const recalcLocalCustomerTotals = async (customerId: string) => {
  const customer = await localDb.customers.get(customerId);
  if (!customer) return;
  const quotes = await localDb.quotations.where('customer_id').equals(customerId).toArray();
  const counted = quotes.filter(q => q.status !== 'archived');
  const spent = counted
    .filter(q => q.status === 'completed')
    .reduce((sum, q) => sum + Number(q.total_cost || 0), 0);
  const last = counted
    .map(q => q.created_at)
    .sort()
    .at(-1) ?? null;
  await localDb.customers.put({
    ...customer,
    total_projects: counted.length,
    total_spent: spent,
    last_project_date: last,
    updated_at: nowIso(),
  });
};
