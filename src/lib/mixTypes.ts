// Custom material mix — quantity-based (bags / kg / pieces).
// Each mix is a flat list of items grouped for display.

export type MixGroup = 'stones' | 'cement' | 'oxides' | 'other';

export interface MixItem {
  /** Stable slug for defaults; free-form for user-added rows. */
  key: string;
  label: string;
  group: MixGroup;
  qty: number;
  unit: string;      // 'bag' | 'kg' | 'each' | 'bundle' | 'box' | 'liter' | 'piece'
  unitPrice: number; // UGX
  /** Only used by grinding: when false the row is excluded from totals & PDF. Undefined = true. */
  enabled?: boolean;
}

export interface Mix {
  items: MixItem[];
}

export interface MixValidationIssue {
  key?: string;
  message: string;
  level: 'error' | 'warn';
}

/** Default catalog for the FLOOR section. Contractors edit qty & unit price. */
export const defaultFloorMix = (): Mix => ({
  items: [
    { key: 'stones-white',   label: 'Stones — White',           group: 'stones', qty: 0, unit: 'bag',   unitPrice: 15000 },
    { key: 'stones-black',   label: 'Stones — Black',           group: 'stones', qty: 0, unit: 'bag',   unitPrice: 13000 },
    { key: 'stones-red',     label: 'Stones — Red',             group: 'stones', qty: 0, unit: 'bag',   unitPrice: 13000 },
    { key: 'cement-white',   label: 'White cement',             group: 'cement', qty: 0, unit: 'bag',   unitPrice: 65000 },
    { key: 'cement-opc',     label: 'Ordinary Portland cement', group: 'cement', qty: 0, unit: 'bag',   unitPrice: 33000 },
    { key: 'oxide-black',    label: 'Oxide — Black',            group: 'oxides', qty: 0, unit: 'kg',    unitPrice: 15000 },
    { key: 'oxide-red',      label: 'Oxide — Red',              group: 'oxides', qty: 0, unit: 'kg',    unitPrice: 15000 },
    { key: 'oxide-yellow',   label: 'Oxide — Yellow',           group: 'oxides', qty: 0, unit: 'kg',    unitPrice: 18000 },
    { key: 'oxide-green',    label: 'Oxide — Green',            group: 'oxides', qty: 0, unit: 'kg',    unitPrice: 20000 },
    { key: 'oxide-blue',     label: 'Oxide — Blue',             group: 'oxides', qty: 0, unit: 'kg',    unitPrice: 22000 },
    { key: 'wooden-strips',  label: 'Wooden strips',            group: 'other',  qty: 0, unit: 'each',  unitPrice: 1000  },
    { key: 'stips',          label: 'Stips',                    group: 'other',  qty: 0, unit: 'bundle',unitPrice: 60000 },
    { key: 'concrete-nails', label: 'Concrete nails',           group: 'other',  qty: 0, unit: 'box',   unitPrice: 5000  },
    { key: 'soft-brush',     label: 'Soft brush',               group: 'other',  qty: 0, unit: 'each',  unitPrice: 12000 },
  ],
});

/** Default catalog for the SKIRTING section (no wooden strips by default). */
export const defaultSkirtingMix = (): Mix => ({
  items: [
    { key: 'stones-white',   label: 'Skirting stones — White', group: 'stones', qty: 0, unit: 'bag',   unitPrice: 15000 },
    { key: 'stones-black',   label: 'Skirting stones — Black', group: 'stones', qty: 0, unit: 'bag',   unitPrice: 13000 },
    { key: 'stones-red',     label: 'Skirting stones — Red',   group: 'stones', qty: 0, unit: 'bag',   unitPrice: 13000 },
    { key: 'cement-white',   label: 'White cement',            group: 'cement', qty: 0, unit: 'bag',   unitPrice: 65000 },
    { key: 'cement-opc',     label: 'Ordinary Portland cement',group: 'cement', qty: 0, unit: 'bag',   unitPrice: 33000 },
    { key: 'oxide-black',    label: 'Oxide — Black',           group: 'oxides', qty: 0, unit: 'kg',    unitPrice: 15000 },
    { key: 'oxide-red',      label: 'Oxide — Red',             group: 'oxides', qty: 0, unit: 'kg',    unitPrice: 15000 },
    { key: 'oxide-yellow',   label: 'Oxide — Yellow',          group: 'oxides', qty: 0, unit: 'kg',    unitPrice: 18000 },
  ],
});

/** Suggest starting quantities based on area (m²) — user can override. */
export const suggestFloorQtys = (mix: Mix, area: number): Mix => ({
  items: mix.items.map(it => {
    switch (it.key) {
      case 'stones-white':   return { ...it, qty: Math.ceil((area / 2) * (5/7)) };
      case 'stones-black':   return { ...it, qty: Math.ceil((area / 2) * (2/7) * (14/24)) };
      case 'stones-red':     return { ...it, qty: Math.ceil((area / 2) * (2/7) * (10/24)) };
      case 'cement-white':   return { ...it, qty: Math.ceil(area / 8) };
      case 'cement-opc':     return { ...it, qty: Math.ceil((area / 2) / 2) };
      case 'wooden-strips':  return { ...it, qty: Math.ceil(area / 2.67) };
      case 'stips':          return { ...it, qty: Math.ceil(area / 26.67) };
      case 'concrete-nails': return { ...it, qty: Math.ceil(area / 26.67) };
      case 'soft-brush':     return { ...it, qty: Math.ceil(area / 16) };
      default: return it;
    }
  }),
});

export const suggestSkirtingQtys = (mix: Mix, area: number): Mix => ({
  items: mix.items.map(it => {
    switch (it.key) {
      case 'stones-white':  return { ...it, qty: Math.ceil((area / 3.33) * (5/7)) };
      case 'stones-black':  return { ...it, qty: Math.ceil((area / 3.33) * (2/7) * (11/24)) };
      case 'stones-red':    return { ...it, qty: Math.ceil((area / 3.33) * (2/7) * (4/24)) };
      case 'cement-white':  return { ...it, qty: Math.ceil(area / 10) };
      case 'cement-opc':    return { ...it, qty: Math.ceil((area / 3.33) / 2) };
      default: return it;
    }
  }),
});

export const mixEnabledItems = (mix: Mix): MixItem[] =>
  mix.items.filter(i => i.enabled !== false);

export const mixTotal = (mix: Mix): number =>
  mixEnabledItems(mix).reduce((s, it) => s + (Math.max(0, it.qty) * Math.max(0, it.unitPrice)), 0);

/** Default catalog for the GRINDING phase — all items disabled by default so users pick only what applies. */
export const defaultGrindingMix = (): Mix => ({
  items: [
    { key: 'big-diamond',    label: 'Big machine diamond tools', group: 'other', qty: 0, unit: 'set',   unitPrice: 150000, enabled: false },
    { key: 'grinder-diamond',label: 'Grinder diamond tools',     group: 'other', qty: 0, unit: 'piece', unitPrice: 60000,  enabled: false },
    { key: 'pad-50',         label: 'Pads — 50 grit',            group: 'other', qty: 0, unit: 'pad',   unitPrice: 20000,  enabled: false },
    { key: 'pad-100',        label: 'Pads — 100 grit',           group: 'other', qty: 0, unit: 'pad',   unitPrice: 20000,  enabled: false },
    { key: 'pad-200',        label: 'Pads — 200 grit',           group: 'other', qty: 0, unit: 'pad',   unitPrice: 20000,  enabled: false },
    { key: 'pad-300',        label: 'Pads — 300 grit',           group: 'other', qty: 0, unit: 'pad',   unitPrice: 20000,  enabled: false },
    { key: 'pad-400',        label: 'Pads — 400 grit',           group: 'other', qty: 0, unit: 'pad',   unitPrice: 20000,  enabled: false },
    { key: 'pad-500',        label: 'Pads — 500 grit',           group: 'other', qty: 0, unit: 'pad',   unitPrice: 20000,  enabled: false },
    { key: 'pad-holder-g',   label: 'Grinder pad holder',        group: 'other', qty: 0, unit: 'each',  unitPrice: 15000,  enabled: false },
    { key: 'pad-holder-m',   label: 'Machine pad holder',        group: 'other', qty: 0, unit: 'each',  unitPrice: 15000,  enabled: false },
    { key: 'squeezer',       label: 'Squeezer',                  group: 'other', qty: 0, unit: 'each',  unitPrice: 10000,  enabled: false },
    { key: 'polish',         label: 'Polish',                    group: 'other', qty: 0, unit: 'liter', unitPrice: 20000,  enabled: false },
    { key: 'maintainer',     label: 'Maintainer',                group: 'other', qty: 0, unit: 'liter', unitPrice: 10000,  enabled: false },
  ],
});

export const suggestGrindingQtys = (mix: Mix, area: number): Mix => ({
  items: mix.items.map(it => {
    const q = (v: number) => Math.max(1, Math.ceil(v));
    switch (it.key) {
      case 'big-diamond':     return { ...it, enabled: true, qty: q(area / 115) };
      case 'grinder-diamond': return { ...it, enabled: true, qty: q(area / 115) };
      case 'pad-50':          return { ...it, enabled: true, qty: q(area / 77)  };
      case 'pad-100':
      case 'pad-200':
      case 'pad-300':
      case 'pad-400':         return { ...it, enabled: true, qty: q(area / 115) };
      case 'pad-500':         return { ...it, enabled: true, qty: q(area / 230) };
      case 'pad-holder-g':
      case 'pad-holder-m':    return { ...it, enabled: true, qty: q(area / 57.5) };
      case 'squeezer':        return { ...it, enabled: true, qty: q(area / 76.7) };
      case 'polish':          return { ...it, enabled: true, qty: +(area * 0.087).toFixed(2) };
      case 'maintainer':      return { ...it, enabled: true, qty: +(area * 0.174).toFixed(2) };
      default: return it;
    }
  }),
});

export const validateMix = (mix: Mix, area: number): MixValidationIssue[] => {
  const issues: MixValidationIssue[] = [];
  mix.items.forEach(it => {
    if (it.qty < 0)       issues.push({ key: it.key, level: 'error', message: `${it.label}: quantity cannot be negative` });
    if (it.unitPrice < 0) issues.push({ key: it.key, level: 'error', message: `${it.label}: unit price cannot be negative` });
  });
  const stones = mix.items.filter(i => i.group === 'stones').reduce((s, i) => s + i.qty, 0);
  if (stones <= 0) issues.push({ level: 'warn', message: 'No stones added — most terrazzo mixes need at least one stone.' });
  const oxides = mix.items.filter(i => i.group === 'oxides').reduce((s, i) => s + i.qty, 0);
  if (area > 0 && oxides / area > 2) issues.push({ level: 'warn', message: 'Oxide load exceeds 2 kg/m² — please double-check.' });
  return issues;
};

export const cloneMix = (mix: Mix): Mix => ({ items: mix.items.map(i => ({ ...i })) });

/** Skirting area from height (mm) and total wall length (m). */
export const skirtingAreaFromDims = (heightMm: number, wallLengthM: number): number => {
  if (!heightMm || !wallLengthM) return 0;
  return +((heightMm / 1000) * wallLengthM).toFixed(3);
};

export const ftToM2 = (areaFt2: number): number => +(areaFt2 * 0.0929).toFixed(3);
