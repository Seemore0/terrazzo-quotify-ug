import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Customer = Database['public']['Tables']['customers']['Row'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];

export const useCustomers = () => useQuery({
  queryKey: ['customers'],
  queryFn: async (): Promise<Customer[]> => {
    const { data, error } = await supabase
      .from('customers').select('*').eq('archived', false).order('name');
    if (error) throw error;
    return data ?? [];
  },
});

export const useCustomer = (id: string | undefined) => useQuery({
  queryKey: ['customer', id],
  enabled: !!id,
  queryFn: async (): Promise<Customer | null> => {
    const { data, error } = await supabase.from('customers').select('*').eq('id', id!).maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const useUpsertCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<CustomerInsert, 'owner_id'>): Promise<Customer> => {
      const { data: userRes } = await supabase.auth.getUser();
      const owner_id = userRes.user?.id;
      if (!owner_id) throw new Error('Sign in required');
      // Find by phone within owner
      const { data: existing } = await supabase
        .from('customers').select('*').eq('owner_id', owner_id).eq('phone', input.phone).maybeSingle();
      if (existing) {
        const { data, error } = await supabase.from('customers')
          .update({ name: input.name, email: input.email, location: input.location, notes: input.notes })
          .eq('id', existing.id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from('customers')
        .insert({ ...input, owner_id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); },
  });
};

export const useArchiveCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('customers').update({ archived: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
};
