
-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =========================================================
-- ROLES
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- =========================================================
-- SHARED updated_at TRIGGER FN
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- AUTO-CREATE PROFILE + DEFAULT ROLE ON SIGNUP
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- PRICING PRESETS (cloud config)
-- =========================================================
CREATE TABLE public.pricing_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_presets TO authenticated;
GRANT SELECT ON public.pricing_presets TO anon;
GRANT ALL ON public.pricing_presets TO service_role;
ALTER TABLE public.pricing_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads public presets" ON public.pricing_presets FOR SELECT
  USING (is_public = true OR auth.uid() = owner_id);
CREATE POLICY "Owner inserts presets" ON public.pricing_presets FOR INSERT
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner updates presets" ON public.pricing_presets FOR UPDATE
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner deletes presets" ON public.pricing_presets FOR DELETE
  USING (auth.uid() = owner_id);

CREATE TRIGGER trg_presets_updated BEFORE UPDATE ON public.pricing_presets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- CUSTOMERS
-- =========================================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  location TEXT,
  notes TEXT,
  total_projects INT NOT NULL DEFAULT 0,
  total_spent NUMERIC(14,2) NOT NULL DEFAULT 0,
  last_project_date DATE,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, phone)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages customers" ON public.customers FOR ALL
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_customers_owner ON public.customers(owner_id);
CREATE INDEX idx_customers_phone ON public.customers(phone);

-- =========================================================
-- QUOTE NUMBER COUNTER
-- =========================================================
CREATE TABLE public.quote_counters (
  year INT PRIMARY KEY,
  last_seq INT NOT NULL DEFAULT 0
);
GRANT ALL ON public.quote_counters TO service_role;
ALTER TABLE public.quote_counters ENABLE ROW LEVEL SECURITY;
-- no policies: only accessed via SECURITY DEFINER fn

CREATE OR REPLACE FUNCTION public.next_quote_number()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  yr INT := EXTRACT(YEAR FROM now())::INT;
  seq INT;
BEGIN
  INSERT INTO public.quote_counters(year, last_seq) VALUES (yr, 1)
    ON CONFLICT (year) DO UPDATE SET last_seq = public.quote_counters.last_seq + 1
    RETURNING last_seq INTO seq;
  RETURN 'TQ-' || yr::TEXT || '-' || LPAD(seq::TEXT, 4, '0');
END;
$$;

-- =========================================================
-- QUOTATIONS
-- =========================================================
CREATE TYPE public.quote_status AS ENUM ('draft','sent','approved','rejected','completed','archived');

CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  -- snapshot (immutable copy at creation)
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_location TEXT,
  -- project
  area_m2 NUMERIC(12,2) NOT NULL,
  work_mode TEXT NOT NULL,
  style_id TEXT,
  pattern_id TEXT,
  rate_per_m2 NUMERIC(12,2),
  materials JSONB,
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
  profit NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  status public.quote_status NOT NULL DEFAULT 'draft',
  pdf_url TEXT,
  preset_id UUID REFERENCES public.pricing_presets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotations TO authenticated;
GRANT ALL ON public.quotations TO service_role;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages quotations" ON public.quotations FOR ALL
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TRIGGER trg_quotations_updated BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_quotations_owner ON public.quotations(owner_id);
CREATE INDEX idx_quotations_customer ON public.quotations(customer_id);
CREATE INDEX idx_quotations_status ON public.quotations(status);
CREATE INDEX idx_quotations_created ON public.quotations(created_at DESC);

-- Trigger: assign quote_number if missing
CREATE OR REPLACE FUNCTION public.assign_quote_number()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
    NEW.quote_number := public.next_quote_number();
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_quotations_number BEFORE INSERT ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.assign_quote_number();

-- Trigger: recalc customer aggregates on quote status changes
CREATE OR REPLACE FUNCTION public.recalc_customer_totals()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cid UUID := COALESCE(NEW.customer_id, OLD.customer_id);
BEGIN
  IF cid IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  UPDATE public.customers c SET
    total_projects = (SELECT COUNT(*) FROM public.quotations q WHERE q.customer_id = cid AND q.status = 'completed'),
    total_spent    = COALESCE((SELECT SUM(total_cost) FROM public.quotations q WHERE q.customer_id = cid AND q.status = 'completed'),0),
    last_project_date = (SELECT MAX(created_at)::DATE FROM public.quotations q WHERE q.customer_id = cid AND q.status = 'completed')
  WHERE c.id = cid;
  RETURN COALESCE(NEW, OLD);
END;
$$;
CREATE TRIGGER trg_quotations_customer_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.recalc_customer_totals();

-- =========================================================
-- PRICE HISTORY (admin audit)
-- =========================================================
CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preset_id UUID REFERENCES public.pricing_presets(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_key TEXT NOT NULL,
  old_value NUMERIC(14,2),
  new_value NUMERIC(14,2),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.price_history TO authenticated;
GRANT ALL ON public.price_history TO service_role;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read history" ON public.price_history FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users log own history" ON public.price_history FOR INSERT
  WITH CHECK (auth.uid() = changed_by);
