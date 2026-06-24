import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DEFAULT_PRESET, type Preset, type PresetConfig } from './presetTypes';
import { fetchPresets, updatePreset as apiUpdate } from './presetsApi';
import { useAuth } from '@/hooks/useAuth';

const ACTIVE_PRESET_KEY = 'terrazzo-active-preset-id';

interface PresetCtx {
  presets: Preset[];
  activePreset: Preset;
  activeId: string;
  setActiveId: (id: string) => void;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  saveActiveConfig: (config: PresetConfig) => Promise<void>;
  /** Whether the DB table is reachable. False ⇒ falls back to the built-in default. */
  dbReady: boolean;
}

const Ctx = createContext<PresetCtx | null>(null);

export const PresetProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [presets, setPresets] = useState<Preset[]>([DEFAULT_PRESET]);
  const [activeId, setActiveIdState] = useState<string>(() => {
    try { return localStorage.getItem(ACTIVE_PRESET_KEY) || DEFAULT_PRESET.id; } catch { return DEFAULT_PRESET.id; }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbReady, setDbReady] = useState(true);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const list = await fetchPresets();
      if (!mounted.current) return;
      // Always keep built-in default as a safety net at the bottom of the list
      const merged = [...list];
      setPresets(merged.length ? merged : [DEFAULT_PRESET]);
      setDbReady(true);
    } catch (e: any) {
      setError(e?.message ?? 'Could not load presets');
      setPresets([DEFAULT_PRESET]);
      setDbReady(false);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    return () => { mounted.current = false; };
  }, [refresh, user?.id]);

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
    try { localStorage.setItem(ACTIVE_PRESET_KEY, id); } catch {}
  }, []);

  const activePreset = useMemo(() => {
    return presets.find(p => p.id === activeId) ?? presets[0] ?? DEFAULT_PRESET;
  }, [presets, activeId]);

  const saveActiveConfig = useCallback(async (config: PresetConfig) => {
    if (activePreset.id === DEFAULT_PRESET.id || activePreset.id.startsWith('builtin-')) {
      throw new Error('Cannot edit the built-in Default preset. Create or pick one of your own presets first.');
    }
    if (!user) throw new Error('Sign in to save changes.');
    if (activePreset.owner_id && activePreset.owner_id !== user.id) {
      throw new Error('You can only edit presets you own.');
    }
    const updated = await apiUpdate(activePreset.id, { config });
    setPresets(prev => prev.map(p => p.id === updated.id ? updated : p));
  }, [activePreset, user]);

  const value: PresetCtx = { presets, activePreset, activeId: activePreset.id, setActiveId, loading, error, refresh, saveActiveConfig, dbReady };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const usePresets = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePresets must be used inside <PresetProvider>');
  return ctx;
};
