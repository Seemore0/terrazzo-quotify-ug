import { localDb, newId, nowIso, type LocalMixPreset, type LocalPricingPreset } from './db';
import { localOwnerId } from './identity';
import { DEFAULT_CONFIG, DEFAULT_PRESET, type PresetConfig } from '@/lib/presetTypes';
import { defaultFloorMix, defaultSkirtingMix, type Mix } from '@/lib/mixTypes';
import type { MixPresetKind } from '@/hooks/useMixPresets';

/* ---------- pricing presets (styles / patterns / material prices / formulas) ---------- */

export const listLocalPricingPresets = async (): Promise<LocalPricingPreset[]> => {
  const owner = localOwnerId();
  const rows = await localDb.pricingPresets.toArray();
  return rows
    .filter(p => p.is_public || p.owner_id === owner || p.owner_id === null)
    .sort((a, b) => Number(b.is_public) - Number(a.is_public) || a.name.localeCompare(b.name));
};

export const putLocalPricingPresets = async (rows: LocalPricingPreset[]) => {
  if (rows.length) await localDb.pricingPresets.bulkPut(rows);
};

export const createLocalPricingPreset = async (
  name: string,
  config: PresetConfig,
  isPublic = false,
): Promise<LocalPricingPreset> => {
  const row: LocalPricingPreset = {
    id: newId(),
    owner_id: localOwnerId(),
    name,
    is_public: isPublic,
    config,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  await localDb.pricingPresets.put(row);
  return row;
};

export const updateLocalPricingPreset = async (
  id: string,
  patch: Partial<Pick<LocalPricingPreset, 'name' | 'config' | 'is_public'>>,
): Promise<LocalPricingPreset> => {
  const existing = await localDb.pricingPresets.get(id);
  if (!existing) throw new Error('Preset not found on this device');
  const updated = { ...existing, ...patch, updated_at: nowIso() };
  await localDb.pricingPresets.put(updated);
  return updated;
};

export const deleteLocalPricingPreset = async (id: string) => {
  await localDb.pricingPresets.delete(id);
};

/* ---------- mix presets ---------- */

const builtinMixes = (): LocalMixPreset[] => {
  const make = (id: string, name: string, kind: MixPresetKind, mix: Mix): LocalMixPreset => ({
    id, owner_id: null, name, kind, mix, is_builtin: true,
  });
  return [
    make('builtin-mix-floor', 'Standard floor mix', 'floor', defaultFloorMix()),
    make('builtin-mix-skirting', 'Standard skirting mix', 'skirting', defaultSkirtingMix()),
  ];
};

export const listLocalMixPresets = async (): Promise<LocalMixPreset[]> => {
  const owner = localOwnerId();
  const rows = await localDb.mixPresets.toArray();
  return rows
    .filter(p => p.is_builtin || p.owner_id === owner || p.owner_id === null)
    .sort((a, b) => Number(b.is_builtin) - Number(a.is_builtin) || a.name.localeCompare(b.name));
};

export const putLocalMixPresets = async (rows: LocalMixPreset[]) => {
  if (rows.length) await localDb.mixPresets.bulkPut(rows);
};

export const createLocalMixPreset = async (
  name: string, kind: MixPresetKind, mix: Mix,
): Promise<LocalMixPreset> => {
  const row: LocalMixPreset = { id: newId(), owner_id: localOwnerId(), name, kind, mix, is_builtin: false };
  await localDb.mixPresets.put(row);
  return row;
};

export const deleteLocalMixPreset = async (id: string) => {
  await localDb.mixPresets.delete(id);
};

/* ---------- first-run seeding (works with no network, ever) ---------- */

let seeded = false;

export const seedLocalData = async (): Promise<void> => {
  if (seeded) return;
  seeded = true;
  try {
    const pricingCount = await localDb.pricingPresets.count();
    if (pricingCount === 0) {
      await localDb.pricingPresets.put({
        ...DEFAULT_PRESET,
        config: structuredClone(DEFAULT_CONFIG),
        created_at: nowIso(),
        updated_at: nowIso(),
      });
    }
    const mixCount = await localDb.mixPresets.count();
    if (mixCount === 0) await localDb.mixPresets.bulkPut(builtinMixes());
  } catch (error) {
    console.warn('[offline] Seeding local data failed', error);
  }
};
