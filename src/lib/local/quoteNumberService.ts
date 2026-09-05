import { localDb } from './db';
import { localOwnerId } from './identity';

const stamp = (d: Date) =>
  `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

/**
 * Offline quotation number: QT-YYMMDD-0001, unique per device/owner/day.
 * Uses an atomic Dexie transaction so two quick saves can never collide.
 */
export const nextLocalQuoteNumber = async (): Promise<string> => {
  const owner = localOwnerId();
  const day = stamp(new Date());
  const key = `${owner}:${day}`;

  const seq = await localDb.transaction('rw', localDb.counters, localDb.quotations, async () => {
    const row = await localDb.counters.get(key);
    let next = (row?.last_seq ?? 0) + 1;
    // Safety net: never reuse a number already present locally.
    for (;;) {
      const candidate = `QT-${day}-${String(next).padStart(4, '0')}`;
      const clash = await localDb.quotations.where('quote_number').equals(candidate).first();
      if (!clash) break;
      next += 1;
    }
    await localDb.counters.put({ key, last_seq: next });
    return next;
  });

  return `QT-${day}-${String(seq).padStart(4, '0')}`;
};
