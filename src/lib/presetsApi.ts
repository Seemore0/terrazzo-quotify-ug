import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_CONFIG, type Preset, type PresetConfig } from './presetTypes';

// External Supabase tables aren't in the generated Database type, so cast.
const presets = () => (supabase as any).from('pricing_presets');

export const fetchPresets = async (): Promise<Preset[]> => {
  const { data, error } = await presets().select('*').order('is_public', { ascending: false }).order('name');
  if (error) throw error;
  return (data ?? []) as Preset[];
};

export const createPreset = async (
  name: string,
  config: PresetConfig,
  isPublic = false,
): Promise<Preset> => {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) throw new Error('Sign in required to create a preset.');
  const { data, error } = await presets()
    .insert({ name, config, owner_id: uid, is_public: isPublic })
    .select()
    .single();
  if (error) throw error;
  return data as Preset;
};

export const updatePreset = async (id: string, patch: Partial<Pick<Preset, 'name' | 'config' | 'is_public'>>): Promise<Preset> => {
  const { data, error } = await presets().update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as Preset;
};

export const deletePreset = async (id: string): Promise<void> => {
  const { error } = await presets().delete().eq('id', id);
  if (error) throw error;
};

export const duplicatePreset = async (preset: Preset, newName: string): Promise<Preset> => {
  return createPreset(newName, preset.config, false);
};

/** Fallback used when DB is unreachable or empty. */
export const buildDefaultConfig = (): PresetConfig => structuredClone(DEFAULT_CONFIG);
