
-- 1. Extend quotations for combined project extras
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS has_sections BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS transport_cost NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profit_pct NUMERIC NOT NULL DEFAULT 0;

-- 2. Section kind enum
DO $$ BEGIN
  CREATE TYPE public.section_kind AS ENUM ('floor', 'skirting');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.mix_preset_kind AS ENUM ('floor', 'skirting', 'any');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. quotation_sections
CREATE TABLE IF NOT EXISTS public.quotation_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  kind public.section_kind NOT NULL,
  area_m2 NUMERIC NOT NULL DEFAULT 0,
  height_mm NUMERIC,
  wall_length_m NUMERIC,
  thickness_mm NUMERIC,
  style_id TEXT,
  pattern_id TEXT,
  colour TEXT,
  rate_per_m2 NUMERIC NOT NULL DEFAULT 0,
  materials_cost NUMERIC NOT NULL DEFAULT 0,
  mix JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotation_sections_quote ON public.quotation_sections(quote_id);
CREATE INDEX IF NOT EXISTS idx_quotation_sections_owner ON public.quotation_sections(owner_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotation_sections TO authenticated;
GRANT ALL ON public.quotation_sections TO service_role;

ALTER TABLE public.quotation_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages quotation sections"
  ON public.quotation_sections FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE TRIGGER trg_quotation_sections_updated
  BEFORE UPDATE ON public.quotation_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. mix_presets
CREATE TABLE IF NOT EXISTS public.mix_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID,
  name TEXT NOT NULL,
  kind public.mix_preset_kind NOT NULL DEFAULT 'any',
  mix JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_builtin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mix_presets_owner ON public.mix_presets(owner_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mix_presets TO authenticated;
GRANT ALL ON public.mix_presets TO service_role;

ALTER TABLE public.mix_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in reads builtin or own mix presets"
  ON public.mix_presets FOR SELECT
  TO authenticated
  USING (is_builtin = TRUE OR auth.uid() = owner_id);

CREATE POLICY "Owner inserts mix presets"
  ON public.mix_presets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id AND is_builtin = FALSE);

CREATE POLICY "Owner updates own mix presets"
  ON public.mix_presets FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id AND is_builtin = FALSE)
  WITH CHECK (auth.uid() = owner_id AND is_builtin = FALSE);

CREATE POLICY "Owner deletes own mix presets"
  ON public.mix_presets FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id AND is_builtin = FALSE);

CREATE TRIGGER trg_mix_presets_updated
  BEFORE UPDATE ON public.mix_presets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Seed built-in mixes
-- mix schema: { stones: {white,black,red,other} (bags), cement: {white,opc} (bags), oxides: {black,red,yellow,green,blue,other} (kg) }
INSERT INTO public.mix_presets (owner_id, name, kind, mix, is_builtin) VALUES
  (NULL, 'Pure White Terrazzo', 'any',
    '{"stones":{"white":1.0,"black":0,"red":0,"other":0},"cement":{"white":1.0,"opc":0},"oxides":{"black":0,"red":0,"yellow":0,"green":0,"blue":0,"other":0}}'::jsonb, TRUE),
  (NULL, 'Black & White Mix', 'any',
    '{"stones":{"white":0.6,"black":0.4,"red":0,"other":0},"cement":{"white":0.7,"opc":0.3},"oxides":{"black":0.1,"red":0,"yellow":0,"green":0,"blue":0,"other":0}}'::jsonb, TRUE),
  (NULL, 'Red Decorative Mix', 'any',
    '{"stones":{"white":0.4,"black":0.1,"red":0.5,"other":0},"cement":{"white":0.5,"opc":0.5},"oxides":{"black":0,"red":0.25,"yellow":0,"green":0,"blue":0,"other":0}}'::jsonb, TRUE),
  (NULL, 'Hospital White Finish', 'any',
    '{"stones":{"white":0.95,"black":0.05,"red":0,"other":0},"cement":{"white":1.0,"opc":0},"oxides":{"black":0,"red":0,"yellow":0,"green":0,"blue":0,"other":0}}'::jsonb, TRUE),
  (NULL, 'School Standard Mix', 'any',
    '{"stones":{"white":0.5,"black":0.3,"red":0.2,"other":0},"cement":{"white":0.4,"opc":0.6},"oxides":{"black":0.05,"red":0.05,"yellow":0,"green":0,"blue":0,"other":0}}'::jsonb, TRUE)
ON CONFLICT DO NOTHING;
