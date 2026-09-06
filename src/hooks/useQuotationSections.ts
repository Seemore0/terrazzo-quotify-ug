import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Mix } from '@/lib/mixTypes';
import { cloudActive } from '@/lib/local/connection';
import { listLocalSections, putLocalSections, replaceLocalSections } from '@/lib/local/localQuotationService';

export type SectionKind = 'floor' | 'skirting';

export interface QuotationSection {
  id: string;
  quote_id: string;
  owner_id: string;
  kind: SectionKind;
  area_m2: number;
  height_mm: number | null;
  wall_length_m: number | null;
  thickness_mm: number | null;
  style_id: string | null;
  pattern_id: string | null;
  colour: string | null;
  rate_per_m2: number;
  materials_cost: number;
  mix: Mix;
  sort: number;
}

export type SectionInsert = Omit<QuotationSection, 'id' | 'owner_id' | 'quote_id'>;

const tryCloud = async <T>(fn: () => Promise<T>): Promise<T | null> => {
  if (!cloudActive()) return null;
  try {
    return await fn();
  } catch (error) {
    console.warn('[offline] cloud call skipped', error);
    return null;
  }
};

export const useQuotationSections = (quoteId: string | undefined) => useQuery({
  queryKey: ['quotation-sections', quoteId],
  enabled: !!quoteId,
  queryFn: async (): Promise<QuotationSection[]> => {
    await tryCloud(async () => {
      const { data, error } = await (supabase as any)
        .from('quotation_sections')
        .select('*')
        .eq('quote_id', quoteId!);
      if (error) throw error;
      await putLocalSections((data ?? []) as QuotationSection[]);
    });
    return listLocalSections(quoteId!);
  },
});

export const useReplaceSections = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ quoteId, sections }: { quoteId: string; sections: SectionInsert[] }) => {
      const rows = await replaceLocalSections(quoteId, sections);
      await tryCloud(async () => {
        const { data: userRes } = await supabase.auth.getUser();
        const owner_id = userRes.user?.id;
        if (!owner_id) return;
        await (supabase as any).from('quotation_sections').delete().eq('quote_id', quoteId);
        if (rows.length) {
          await (supabase as any).from('quotation_sections')
            .insert(rows.map(r => ({ ...r, owner_id })));
        }
      });
      return rows;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['quotation-sections', v.quoteId] });
      qc.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};
