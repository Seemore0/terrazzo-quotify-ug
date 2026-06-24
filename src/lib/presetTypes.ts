export type WorkMode = 'materials' | 'labour' | 'full';
export type Phase = 'casting' | 'grinding';

export interface StyleRow {
  id: string;
  name: string;
  description: string;
  materialsRate: number;
  labourRate: number;
  active: boolean;
  sort: number;
}

export interface PatternRow {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  active: boolean;
  sort: number;
}

export interface MaterialRow {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  qtyOp: 'divide' | 'multiply';
  qtyFactor: number;
  active: boolean;
  sort: number;
}

export interface PresetConfig {
  styles: StyleRow[];
  patterns: PatternRow[];
  materials: {
    casting: MaterialRow[];
    grinding: MaterialRow[];
  };
}

export interface Preset {
  id: string;
  owner_id: string | null;
  name: string;
  is_public: boolean;
  config: PresetConfig;
  created_at?: string;
  updated_at?: string;
}

/** Built-in default config used when the DB is empty or unreachable. */
export const DEFAULT_CONFIG: PresetConfig = {
  styles: [
    { id: 'fine', name: 'Fine Aggregate', description: 'Small stone chips for a smooth, elegant finish', materialsRate: 18926, labourRate: 8043, active: true, sort: 0 },
    { id: 'medium', name: 'Medium Aggregate', description: 'Medium stone chips for a balanced, classic look', materialsRate: 22000, labourRate: 9500, active: true, sort: 1 },
    { id: 'bold', name: 'Bold Aggregate', description: 'Large stone chips for a dramatic, bold appearance', materialsRate: 26000, labourRate: 11000, active: true, sort: 2 },
    { id: 'custom', name: 'Custom Mix', description: 'Bespoke blend of aggregates tailored to your design', materialsRate: 30000, labourRate: 13000, active: true, sort: 3 },
  ],
  patterns: [
    { id: 'plain', name: 'Plain', description: 'No pattern — clean, uniform surface', multiplier: 1.0, active: true, sort: 0 },
    { id: 'divider', name: 'Divider Strips', description: 'Metal or brass divider strips between sections', multiplier: 1.10, active: true, sort: 1 },
    { id: 'geometric', name: 'Geometric Pattern', description: 'Custom geometric shapes and designs', multiplier: 1.25, active: true, sort: 2 },
    { id: 'custom', name: 'Custom Pattern', description: 'Fully bespoke pattern designed to your specification', multiplier: 1.40, active: true, sort: 3 },
  ],
  materials: {
    casting: [
      { id: 'c-stones-floor-white', name: 'Stones floor white', unit: 'bag', unitPrice: 15000, qtyOp: 'divide', qtyFactor: 2.8, active: true, sort: 0 },
      { id: 'c-stones-floor-black', name: 'Stones floor black', unit: 'bag', unitPrice: 13000, qtyOp: 'divide', qtyFactor: 24, active: true, sort: 1 },
      { id: 'c-stones-floor-red', name: 'Stones floor red', unit: 'bag', unitPrice: 13000, qtyOp: 'divide', qtyFactor: 33.6, active: true, sort: 2 },
      { id: 'c-stones-skirting-white', name: 'Stones skirting white', unit: 'bag', unitPrice: 15000, qtyOp: 'divide', qtyFactor: 4.662, active: true, sort: 3 },
      { id: 'c-stones-skirting-black', name: 'Stones skirting black', unit: 'bag', unitPrice: 13000, qtyOp: 'divide', qtyFactor: 25.43, active: true, sort: 4 },
      { id: 'c-stones-skirting-red', name: 'Stones skirting red', unit: 'bag', unitPrice: 13000, qtyOp: 'divide', qtyFactor: 69.93, active: true, sort: 5 },
      { id: 'c-stips', name: 'Stips', unit: 'bundle', unitPrice: 60000, qtyOp: 'divide', qtyFactor: 26.67, active: true, sort: 6 },
      { id: 'c-soft-brush', name: 'Soft brush', unit: 'each', unitPrice: 12000, qtyOp: 'divide', qtyFactor: 16, active: true, sort: 7 },
      { id: 'c-black-oxide', name: 'Black oxide', unit: 'kg', unitPrice: 15000, qtyOp: 'multiply', qtyFactor: 0.25, active: true, sort: 8 },
      { id: 'c-concrete-nails', name: 'Concrete nails', unit: 'box', unitPrice: 5000, qtyOp: 'divide', qtyFactor: 26.67, active: true, sort: 9 },
      { id: 'c-wooden-strips', name: 'Wooden strips', unit: 'each', unitPrice: 1000, qtyOp: 'divide', qtyFactor: 2.67, active: true, sort: 10 },
      { id: 'c-ordinary-cement', name: 'Ordinary cement', unit: 'bag', unitPrice: 33000, qtyOp: 'divide', qtyFactor: 4, active: true, sort: 11 },
      { id: 'c-white-cement', name: 'White cement', unit: 'bag', unitPrice: 65000, qtyOp: 'divide', qtyFactor: 8, active: true, sort: 12 },
    ],
    grinding: [
      { id: 'g-big-machine-pads', name: 'Big machine diamond pads', unit: 'set', unitPrice: 150000, qtyOp: 'divide', qtyFactor: 115, active: true, sort: 0 },
      { id: 'g-grinder-pads', name: 'Grinder diamond pads', unit: 'piece', unitPrice: 60000, qtyOp: 'divide', qtyFactor: 115, active: true, sort: 1 },
      { id: 'g-pads-50', name: 'Pads 50 grit', unit: 'pad', unitPrice: 20000, qtyOp: 'divide', qtyFactor: 77, active: true, sort: 2 },
      { id: 'g-pads-100', name: 'Pads 100 grit', unit: 'pad', unitPrice: 20000, qtyOp: 'divide', qtyFactor: 115, active: true, sort: 3 },
      { id: 'g-pads-200', name: 'Pads 200 grit', unit: 'pad', unitPrice: 20000, qtyOp: 'divide', qtyFactor: 115, active: true, sort: 4 },
      { id: 'g-pads-300', name: 'Pads 300 grit', unit: 'pad', unitPrice: 20000, qtyOp: 'divide', qtyFactor: 115, active: true, sort: 5 },
      { id: 'g-pads-400', name: 'Pads 400 grit', unit: 'pad', unitPrice: 20000, qtyOp: 'divide', qtyFactor: 115, active: true, sort: 6 },
      { id: 'g-pads-500', name: 'Pads 500 grit', unit: 'pad', unitPrice: 20000, qtyOp: 'divide', qtyFactor: 230, active: true, sort: 7 },
      { id: 'g-grinder-holder', name: 'Grinder pad holder', unit: 'each', unitPrice: 15000, qtyOp: 'divide', qtyFactor: 57.5, active: true, sort: 8 },
      { id: 'g-machine-holder', name: 'Machine pad holder', unit: 'each', unitPrice: 15000, qtyOp: 'divide', qtyFactor: 57.5, active: true, sort: 9 },
      { id: 'g-squeezer', name: 'Squeezer', unit: 'each', unitPrice: 10000, qtyOp: 'divide', qtyFactor: 76.7, active: true, sort: 10 },
      { id: 'g-polish', name: 'Polish', unit: 'liter', unitPrice: 20000, qtyOp: 'multiply', qtyFactor: 0.087, active: true, sort: 11 },
      { id: 'g-maintainer', name: 'Maintainer', unit: 'liter', unitPrice: 10000, qtyOp: 'multiply', qtyFactor: 0.174, active: true, sort: 12 },
    ],
  },
};

export const DEFAULT_PRESET: Preset = {
  id: 'builtin-default',
  owner_id: null,
  name: 'Default (built-in)',
  is_public: true,
  config: DEFAULT_CONFIG,
};

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-UG', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(amount)) + ' UGX';

export interface WorkModeConfig { id: WorkMode; name: string; description: string; }
export const WORK_MODES: WorkModeConfig[] = [
  { id: 'materials', name: 'Materials Only', description: 'Includes material costs only — you arrange your own labour' },
  { id: 'labour', name: 'Labour Only', description: 'Includes labour/workmanship costs only — you supply the materials' },
  { id: 'full', name: 'Materials + Labour', description: 'Full package — we supply all materials and provide complete workmanship' },
];

export const calculateRate = (config: PresetConfig, styleId: string, mode: WorkMode, patternId: string): number => {
  const s = config.styles.find(x => x.id === styleId);
  const p = config.patterns.find(x => x.id === patternId);
  if (!s || !p) return 0;
  const base = mode === 'materials' ? s.materialsRate
              : mode === 'labour'   ? s.labourRate
              : s.materialsRate + s.labourRate;
  return Math.round(base * p.multiplier);
};

export const calculateTotal = (config: PresetConfig, area: number, styleId: string, mode: WorkMode, patternId: string): number =>
  area * calculateRate(config, styleId, mode, patternId);

export interface ComputedMaterial {
  id: string;
  item: string;
  unit: string;
  qty: number;
  unitPrice: number;
  total: number;
}

/** Compute material quantities for a given area from a preset's material formulas. */
export const computeMaterials = (config: PresetConfig, phase: Phase, area: number): ComputedMaterial[] => {
  const rows = (config.materials?.[phase] ?? []).filter(r => r.active);
  return rows.map(r => {
    const rawQty = r.qtyOp === 'divide' ? area / (r.qtyFactor || 1) : area * r.qtyFactor;
    const qty = Math.max(0, Math.ceil(rawQty));
    return {
      id: r.id,
      item: r.name,
      unit: r.unit,
      qty,
      unitPrice: r.unitPrice,
      total: qty * r.unitPrice,
    };
  });
};
