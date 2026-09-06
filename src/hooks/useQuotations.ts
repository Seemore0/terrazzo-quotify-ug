import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { cloudActive } from '@/lib/local/connection';
import {
  createLocalQuotation,
  duplicateLocalQuotation,
  getLocalQuotation,
  listLocalQuotations,
  putLocalQuotations,
  updateLocalQuotation,
} from '@/lib/local/localQuotationService';
import { listLocalCustomers } from '@/lib/local/localCustomerService';

export type Quotation = Database['public']['Tables']['quotations']['Row'];
export type QuotationInsert = Database['public']['Tables']['quotations']['Insert'];
export type QuoteStatus = Database['public']['Enums']['quote_status'];

const tryCloud = async <T>(fn: () => Promise<T>): Promise<T | null> => {
  if (!cloudActive()) return null;
  try {
    return await fn();
  } catch (error) {
    console.warn('[offline] cloud call skipped', error);
    return null;
  }
};

export const useQuotations = (filters?: { status?: QuoteStatus; customerId?: string }) => useQuery({
  queryKey: ['quotations', filters],
  queryFn: async (): Promise<Quotation[]> => {
    await tryCloud(async () => {
      const { data, error } = await supabase.from('quotations').select('*');
      if (error) throw error;
      await putLocalQuotations(data ?? []);
    });
    return listLocalQuotations({ status: filters?.status, customerId: filters?.customerId }) as Promise<Quotation[]>;
  },
});

export const useQuotation = (id: string | undefined) => useQuery({
  queryKey: ['quotation', id],
  enabled: !!id,
  queryFn: async () => {
    await tryCloud(async () => {
      const { data, error } = await supabase.from('quotations').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      if (data) await putLocalQuotations([data]);
    });
    return getLocalQuotation(id!);
  },
});

export const useCreateQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<QuotationInsert, 'owner_id' | 'quote_number'>): Promise<Quotation> => {
      const local = await createLocalQuotation(input as Record<string, unknown>);
      await tryCloud(async () => {
        const { data: userRes } = await supabase.auth.getUser();
        const owner_id = userRes.user?.id;
        if (!owner_id) return;
        await supabase.from('quotations')
          .insert({ ...input, id: local.id, quote_number: local.quote_number, owner_id } as any);
      });
      return local as Quotation;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
};

export const useUpdateQuotationStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: QuoteStatus }) => {
      await updateLocalQuotation(id, { status });
      await tryCloud(async () => {
        await supabase.from('quotations').update({ status }).eq('id', id);
      });
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
      const local = await updateLocalQuotation(id, patch as Record<string, unknown>);
      await tryCloud(async () => {
        await supabase.from('quotations').update(patch as any).eq('id', id);
      });
      return local as Quotation;
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
      const copy = await duplicateLocalQuotation(id);
      await tryCloud(async () => {
        const { data: userRes } = await supabase.auth.getUser();
        const owner_id = userRes.user?.id;
        if (!owner_id) return;
        await supabase.from('quotations').insert({ ...copy, owner_id } as any);
      });
      return copy as Quotation;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
};

export const useDashboardStats = () => useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: async () => {
    await tryCloud(async () => {
      const { data, error } = await supabase.from('quotations').select('*');
      if (error) throw error;
      await putLocalQuotations(data ?? []);
    });

    const list = await listLocalQuotations();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthQuotes = list.filter(q => new Date(q.created_at) >= monthStart);
    const completed = list.filter(q => q.status === 'completed');
    const revenue = completed.reduce((s, q) => s + Number(q.total_cost || 0), 0);
    const activeProjects = list.filter(q => q.status === 'in_progress').length;
    const pending = list.filter(q => ['draft', 'sent'].includes(q.status)).length;
    const pipeline = list.filter(q => ['draft', 'sent', 'approved', 'in_progress'].includes(q.status))
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

    const statusMap: Record<string, number> = {};
    list.forEach(q => { statusMap[q.status] = (statusMap[q.status] ?? 0) + 1; });
    const statusDist = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

    const recent = [...list]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    const customers = (await listLocalCustomers()).length;

    return {
      totalQuotes: list.length,
      monthQuotes: monthQuotes.length,
      revenue,
      pipeline,
      customers,
      activeProjects,
      pending,
      completedCount: completed.length,
      monthly,
      statusDist,
      recent,
    };
  },
});
