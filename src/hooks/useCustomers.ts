import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { cloudActive } from '@/lib/local/connection';
import {
  archiveLocalCustomer,
  getLocalCustomer,
  listLocalCustomers,
  putLocalCustomers,
  upsertLocalCustomer,
} from '@/lib/local/localCustomerService';

export type Customer = Database['public']['Tables']['customers']['Row'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];

/** Best-effort cloud call: never let a network/auth failure reach the UI. */
const tryCloud = async <T>(fn: () => Promise<T>): Promise<T | null> => {
  if (!cloudActive()) return null;
  try {
    return await fn();
  } catch (error) {
    console.warn('[offline] cloud call skipped', error);
    return null;
  }
};

export const useCustomers = () => useQuery({
  queryKey: ['customers'],
  queryFn: async (): Promise<Customer[]> => {
    await tryCloud(async () => {
      const { data, error } = await supabase
        .from('customers').select('*').eq('archived', false).order('name');
      if (error) throw error;
      await putLocalCustomers(data ?? []);
    });
    return listLocalCustomers();
  },
});

export const useCustomer = (id: string | undefined) => useQuery({
  queryKey: ['customer', id],
  enabled: !!id,
  queryFn: async (): Promise<Customer | null> => {
    await tryCloud(async () => {
      const { data, error } = await supabase.from('customers').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      if (data) await putLocalCustomers([data]);
    });
    return getLocalCustomer(id!);
  },
});

export const useUpsertCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<CustomerInsert, 'owner_id'>): Promise<Customer> => {
      // Local first: works with no account and no internet.
      const local = await upsertLocalCustomer({
        name: input.name,
        phone: input.phone,
        email: input.email ?? null,
        location: input.location ?? null,
        notes: input.notes ?? null,
      });

      await tryCloud(async () => {
        const { data: userRes } = await supabase.auth.getUser();
        const owner_id = userRes.user?.id;
        if (!owner_id) return;
        const { data: existing } = await supabase
          .from('customers').select('*').eq('owner_id', owner_id).eq('phone', input.phone).maybeSingle();
        if (existing) {
          await supabase.from('customers')
            .update({ name: input.name, email: input.email, location: input.location, notes: input.notes })
            .eq('id', existing.id);
        } else {
          await supabase.from('customers').insert({ ...input, id: local.id, owner_id } as any);
        }
      });

      return local;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); },
  });
};

export const useArchiveCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await archiveLocalCustomer(id);
      await tryCloud(async () => {
        await supabase.from('customers').update({ archived: true }).eq('id', id);
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
};
