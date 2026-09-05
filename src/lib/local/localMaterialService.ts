import type { MaterialRow, Phase, PresetConfig } from '@/lib/presetTypes';
import { updateLocalPricingPreset } from './localPresetService';

/**
 * Materials belong to a pricing preset's config. These helpers keep material
 * add/edit/delete in one place instead of spread across admin components.
 */

export const listMaterials = (config: PresetConfig, phase: Phase): MaterialRow[] =>
  [...config.materials[phase]].sort((a, b) => a.sort - b.sort);

export const upsertMaterial = (config: PresetConfig, phase: Phase, row: MaterialRow): PresetConfig => {
  const rows = config.materials[phase];
  const exists = rows.some(r => r.id === row.id);
  return {
    ...config,
    materials: {
      ...config.materials,
      [phase]: exists ? rows.map(r => (r.id === row.id ? row : r)) : [...rows, row],
    },
  };
};

export const removeMaterial = (config: PresetConfig, phase: Phase, id: string): PresetConfig => ({
  ...config,
  materials: {
    ...config.materials,
    [phase]: config.materials[phase].filter(r => r.id !== id),
  },
});

export const persistMaterials = (presetId: string, config: PresetConfig) =>
  updateLocalPricingPreset(presetId, { config });
