import { useState, useEffect, useCallback } from 'react';
import { TERRAZZO_STYLES, PATTERNS, type StyleConfig, type PatternConfig, type WorkMode, type TerrazzoStyle, type PatternType } from './pricingConfig';

const STORAGE_KEY = 'terrazzo-admin-config';

export interface AdminConfig {
  styles: StyleConfig[];
  patterns: PatternConfig[];
}

const getDefaultConfig = (): AdminConfig => ({
  styles: [...TERRAZZO_STYLES],
  patterns: [...PATTERNS],
});

export const loadAdminConfig = (): AdminConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return getDefaultConfig();
};

export const saveAdminConfig = (config: AdminConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const resetAdminConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const useAdminConfig = () => {
  const [config, setConfig] = useState<AdminConfig>(loadAdminConfig);

  const save = useCallback((updated: AdminConfig) => {
    setConfig(updated);
    saveAdminConfig(updated);
  }, []);

  const reset = useCallback(() => {
    const defaults = getDefaultConfig();
    setConfig(defaults);
    resetAdminConfig();
  }, []);

  return { config, save, reset };
};

// Runtime pricing functions that use admin config
export const calculateRateFromConfig = (
  config: AdminConfig,
  style: TerrazzoStyle,
  mode: WorkMode,
  pattern: PatternType
): number => {
  const styleConfig = config.styles.find(s => s.id === style)!;
  const patternConfig = config.patterns.find(p => p.id === pattern)!;

  let baseRate = 0;
  if (mode === 'materials') baseRate = styleConfig.materialsRate;
  else if (mode === 'labour') baseRate = styleConfig.labourRate;
  else baseRate = styleConfig.materialsRate + styleConfig.labourRate;

  return Math.round(baseRate * patternConfig.multiplier);
};

export const calculateTotalFromConfig = (
  config: AdminConfig,
  area: number,
  style: TerrazzoStyle,
  mode: WorkMode,
  pattern: PatternType
): number => {
  return area * calculateRateFromConfig(config, style, mode, pattern);
};
