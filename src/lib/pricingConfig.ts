export type WorkMode = 'materials' | 'labour' | 'full';
export type TerrazzoStyle = 'fine' | 'medium' | 'bold' | 'custom';
export type PatternType = 'plain' | 'divider' | 'geometric' | 'custom';

export interface StyleConfig {
  id: TerrazzoStyle;
  name: string;
  description: string;
  materialsRate: number; // UGX per m²
  labourRate: number;    // UGX per m²
}

export interface PatternConfig {
  id: PatternType;
  name: string;
  description: string;
  multiplier: number; // e.g. 1.10 = +10%
}

export interface WorkModeConfig {
  id: WorkMode;
  name: string;
  description: string;
}

export const WORK_MODES: WorkModeConfig[] = [
  { id: 'materials', name: 'Materials Only', description: 'Includes material costs only — you arrange your own labour' },
  { id: 'labour', name: 'Labour Only', description: 'Includes labour/workmanship costs only — you supply the materials' },
  { id: 'full', name: 'Materials + Labour', description: 'Full package — we supply all materials and provide complete workmanship' },
];

export const TERRAZZO_STYLES: StyleConfig[] = [
  { id: 'fine', name: 'Fine Aggregate', description: 'Small stone chips for a smooth, elegant finish', materialsRate: 18926, labourRate: 8043 },
  { id: 'medium', name: 'Medium Aggregate', description: 'Medium stone chips for a balanced, classic look', materialsRate: 22000, labourRate: 9500 },
  { id: 'bold', name: 'Bold Aggregate', description: 'Large stone chips for a dramatic, bold appearance', materialsRate: 26000, labourRate: 11000 },
  { id: 'custom', name: 'Custom Mix', description: 'Bespoke blend of aggregates tailored to your design', materialsRate: 30000, labourRate: 13000 },
];

export const PATTERNS: PatternConfig[] = [
  { id: 'plain', name: 'Plain', description: 'No pattern — clean, uniform surface', multiplier: 1.0 },
  { id: 'divider', name: 'Divider Strips', description: 'Metal or brass divider strips between sections', multiplier: 1.10 },
  { id: 'geometric', name: 'Geometric Pattern', description: 'Custom geometric shapes and designs', multiplier: 1.25 },
  { id: 'custom', name: 'Custom Pattern', description: 'Fully bespoke pattern designed to your specification', multiplier: 1.40 },
];

export const calculateRate = (
  style: TerrazzoStyle,
  mode: WorkMode,
  pattern: PatternType
): number => {
  const styleConfig = TERRAZZO_STYLES.find(s => s.id === style)!;
  const patternConfig = PATTERNS.find(p => p.id === pattern)!;

  let baseRate = 0;
  if (mode === 'materials') {
    baseRate = styleConfig.materialsRate;
  } else if (mode === 'labour') {
    baseRate = styleConfig.labourRate;
  } else {
    baseRate = styleConfig.materialsRate + styleConfig.labourRate;
  }

  return Math.round(baseRate * patternConfig.multiplier);
};

export const calculateTotal = (
  area: number,
  style: TerrazzoStyle,
  mode: WorkMode,
  pattern: PatternType
): number => {
  return area * calculateRate(style, mode, pattern);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-UG', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' UGX';
};
