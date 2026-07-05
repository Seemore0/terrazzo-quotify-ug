import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Mix } from '@/lib/mixTypes';

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

export const useQuotationSections = (quoteId: string | undefined) => useQuery({
  queryKey: ['quotation-sections', quoteId],
  enabled: !!quoteId,
  queryFn: async (): Promise<QuotationSection[]> => {
    const { data, error } = await (supabase as any)
      .from('quotation_sections')
      .select('*')
      .eq('quote_id', quoteId!)
      .order('sort', { ascending: true });
    if (error) throw error;
    return (data ?? []) as QuotationSection[];
  },
});

export const useReplaceSections = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ quoteId, sections }: { quoteId: string; sections: SectionInsert[] }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const owner_id = userRes.user?.id;
      if (!owner_id) throw new Error('Sign in required');
      const { error: delErr } = await (supabase as any)
        .from('quotation_sections').delete().eq('quote_id', quoteId);
      if (delErr) throw delErr;
      if (!sections.length) return [];
      const rows = sections.map(s => ({ ...s, quote_id: quoteId, owner_id }));
      const { data, error } = await (supabase as any)
        .from('quotation_sections').insert(rows).select();
      if (error) throw error;
      return data as QuotationSection[];
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['quotation-sections', v.quoteId] });
      qc.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};
