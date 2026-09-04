-- 1) Revoke EXECUTE on SECURITY DEFINER functions that app users must not call directly
REVOKE ALL ON FUNCTION public.assign_quote_number() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.recalc_customer_totals() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.next_quote_number() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.next_quote_number() TO service_role;
-- has_role must stay callable by signed-in users: it is used inside RLS policies
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2) pricing_presets: no anonymous access at all
REVOKE ALL ON TABLE public.pricing_presets FROM anon;
DROP POLICY IF EXISTS "Anyone reads public presets" ON public.pricing_presets;
CREATE POLICY "Signed-in users read public or own presets"
  ON public.pricing_presets FOR SELECT TO authenticated
  USING (is_public = true OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner inserts presets" ON public.pricing_presets;
CREATE POLICY "Owner inserts presets"
  ON public.pricing_presets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner updates presets" ON public.pricing_presets;
CREATE POLICY "Owner updates presets"
  ON public.pricing_presets FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner deletes presets" ON public.pricing_presets;
CREATE POLICY "Owner deletes presets"
  ON public.pricing_presets FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- 3) quote_counters: internal only. Explicitly deny all client access.
ALTER TABLE public.quote_counters ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.quote_counters FROM anon, authenticated;
GRANT ALL ON TABLE public.quote_counters TO service_role;
DROP POLICY IF EXISTS "No client access to quote counters" ON public.quote_counters;
CREATE POLICY "No client access to quote counters"
  ON public.quote_counters FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);