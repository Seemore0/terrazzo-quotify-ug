import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Quotation = Database['public']['Tables']['quotations']['Row'];
export type QuotationInsert = Database['public']['Tables']['quotations']['Insert'];
export type QuoteStatus = Database['public']['Enums']['quote_status'];

export const useQuotations = (filters?: { status?: QuoteStatus; customerId?: string }) => useQuery({
  queryKey: ['quotations', filters],
  queryFn: async (): Promise<Quotation[]> => {
    let q = supabase.from('quotations').select('*').order('created_at', { ascending: false });
    if (filters?.status) q = q.eq('status', filters.status);
    if (filters?.customerId) q = q.eq('customer_id', filters.customerId);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  },
});

export const useQuotation = (id: string | undefined) => useQuery({
  queryKey: ['quotation', id],
  enabled: !!id,
  queryFn: async () => {
    const { data, error } = await supabase.from('quotations').select('*').eq('id', id!).maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const useCreateQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<QuotationInsert, 'owner_id' | 'quote_number'>): Promise<Quotation> => {
      const { data: userRes } = await supabase.auth.getUser();
      const owner_id = userRes.user?.id;
      if (!owner_id) throw new Error('Sign in required');
      const { data, error } = await supabase.from('quotations')
        .insert({ ...input, owner_id } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
};

export const useUpdateQuotationStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: QuoteStatus }) => {
      const { error } = await supabase.from('quotations').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotations'] });
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useDashboardStats = () => useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: async () => {
    const { data: quotes } = await supabase.from('quotations').select('total_cost, status, created_at');
    const list = quotes ?? [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthQuotes = list.filter(q => new Date(q.created_at) >= monthStart);
    const completed = list.filter(q => q.status === 'completed');
    const revenue = completed.reduce((s, q) => s + Number(q.total_cost || 0), 0);
    const pipeline = list.filter(q => ['draft','sent','approved'].includes(q.status))
      .reduce((s, q) => s + Number(q.total_cost || 0), 0);

    // Monthly revenue for last 6 months
    const monthly: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const rev = completed
        .filter(q => { const c = new Date(q.created_at); return c >= d && c < nd; })
        .reduce((s, q) => s + Number(q.total_cost || 0), 0);
      monthly.push({ month: d.toLocaleDateString('en-UG', { month: 'short' }), revenue: rev });
    }

    const { count: customersCount } = await supabase
      .from('customers').select('*', { count: 'exact', head: true }).eq('archived', false);

    return {
      totalQuotes: list.length,
      monthQuotes: monthQuotes.length,
      revenue,
      pipeline,
      customers: customersCount ?? 0,
      monthly,
    };
  },
});
