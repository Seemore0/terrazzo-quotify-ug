import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Mix } from '@/lib/mixTypes';

export type MixPresetKind = 'floor' | 'skirting' | 'any';

export interface MixPreset {
  id: string;
  owner_id: string | null;
  name: string;
  kind: MixPresetKind;
  mix: Mix;
  is_builtin: boolean;
}

export const useMixPresets = () => useQuery({
  queryKey: ['mix-presets'],
  queryFn: async (): Promise<MixPreset[]> => {
    const { data, error } = await (supabase as any)
      .from('mix_presets')
      .select('*')
      .order('is_builtin', { ascending: false })
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []) as MixPreset[];
  },
});

export const useSaveMixPreset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, kind, mix }: { name: string; kind: MixPresetKind; mix: Mix }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const owner_id = userRes.user?.id;
      if (!owner_id) throw new Error('Sign in required to save mix');
      const { data, error } = await (supabase as any)
        .from('mix_presets')
        .insert({ owner_id, name, kind, mix, is_builtin: false })
        .select().single();
      if (error) throw error;
      return data as MixPreset;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mix-presets'] }),
  });
};

export const useDeleteMixPreset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('mix_presets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mix-presets'] }),
  });
};
