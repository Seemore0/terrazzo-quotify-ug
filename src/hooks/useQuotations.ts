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

export const useUpdateQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<QuotationInsert> }) => {
      const { data, error } = await supabase.from('quotations').update(patch).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotations'] });
      qc.invalidateQueries({ queryKey: ['quotation'] });
    },
  });
};

export const useDuplicateQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<Quotation> => {
      const { data: src, error: e1 } = await supabase.from('quotations').select('*').eq('id', id).single();
      if (e1) throw e1;
      const { id: _id, quote_number: _qn, created_at: _c, updated_at: _u, ...rest } = src;
      const { data, error } = await supabase.from('quotations')
        .insert({ ...rest, status: 'draft' } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
};

export const useDashboardStats = () => useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: async () => {
    const { data: quotes } = await supabase.from('quotations').select('total_cost, status, created_at, quote_number, customer_name, id');
    const list = quotes ?? [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthQuotes = list.filter(q => new Date(q.created_at) >= monthStart);
    const completed = list.filter(q => q.status === 'completed');
    const revenue = completed.reduce((s, q) => s + Number(q.total_cost || 0), 0);
    const activeProjects = list.filter(q => q.status === 'in_progress').length;
    const pending = list.filter(q => ['draft','sent'].includes(q.status)).length;
    const pipeline = list.filter(q => ['draft','sent','approved','in_progress'].includes(q.status))
      .reduce((s, q) => s + Number(q.total_cost || 0), 0);

    // Monthly revenue + quote count for last 6 months
    const monthly: { month: string; revenue: number; quotes: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const inRange = list.filter(q => { const c = new Date(q.created_at); return c >= d && c < nd; });
      const rev = inRange.filter(q => q.status === 'completed')
        .reduce((s, q) => s + Number(q.total_cost || 0), 0);
      monthly.push({ month: d.toLocaleDateString('en-UG', { month: 'short' }), revenue: rev, quotes: inRange.length });
    }

    // Status distribution
    const statusMap: Record<string, number> = {};
    list.forEach(q => { statusMap[q.status] = (statusMap[q.status] ?? 0) + 1; });
    const statusDist = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

    // Recent quotations (5 latest)
    const recent = [...list]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    const { count: customersCount } = await supabase
      .from('customers').select('*', { count: 'exact', head: true }).eq('archived', false);

    return {
      totalQuotes: list.length,
      monthQuotes: monthQuotes.length,
      revenue,
      pipeline,
      customers: customersCount ?? 0,
      activeProjects,
      pending,
      completedCount: completed.length,
      monthly,
      statusDist,
      recent,
    };
  },
});
