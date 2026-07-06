import { calculateRate, type PresetConfig, type WorkMode } from './presetTypes';
import { mixTotal, type Mix } from './mixTypes';

export interface Section {
  kind: 'floor' | 'skirting';
  area_m2: number;
  height_mm?: number | null;
  wall_length_m?: number | null;
  thickness_mm?: number | null;
  style_id: string;
  pattern_id: string;
  colour?: string;
  mix: Mix;
}

export interface QuoteExtras {
  workMode: WorkMode;
  transportCost: number;
  profitPct: number;
}

export interface CombinedTotals {
  floorArea: number;
  skirtingArea: number;
  totalArea: number;
  floorMaterials: number;
  skirtingMaterials: number;
  castingMaterials: number;
  grindingMaterials: number;
  materialsTotal: number;
  labourRate: number;
  labourCost: number;
  transport: number;
  subtotalBeforeProfit: number;
  profit: number;
  grandTotal: number;
}

export const combineTotals = (
  config: PresetConfig,
  floor: Section,
  skirting: Section | null,
  extras: QuoteExtras,
  grinding: Mix | null = null
): CombinedTotals => {
  const floorArea = Math.max(0, floor.area_m2 || 0);
  const skirtingArea = skirting ? Math.max(0, skirting.area_m2 || 0) : 0;
  const totalArea = floorArea + skirtingArea;

  const floorMaterials = mixTotal(floor.mix);
  const skirtingMaterials = skirting ? mixTotal(skirting.mix) : 0;
  const castingMaterials = floorMaterials + skirtingMaterials;
  const grindingMaterials = grinding ? mixTotal(grinding) : 0;

  // Labour uses floor's style/pattern for rate (contractor's primary design) but combined area
  const pureLabourRate = calculateRate(config, floor.style_id, 'labour', floor.pattern_id);
  const labourCost = pureLabourRate * totalArea;

  const materialsTotal = castingMaterials + grindingMaterials;
  const transport = Math.max(0, extras.transportCost || 0);
  const subtotalBeforeProfit = materialsTotal + labourCost + transport;
  const profit = subtotalBeforeProfit * (Math.max(0, extras.profitPct || 0) / 100);
  const grandTotal = subtotalBeforeProfit + profit;

  return {
    floorArea, skirtingArea, totalArea,
    floorMaterials, skirtingMaterials,
    castingMaterials, grindingMaterials, materialsTotal,
    labourRate: pureLabourRate, labourCost,
    transport, subtotalBeforeProfit, profit, grandTotal,
  };
};
