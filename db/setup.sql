-- ============================================================
-- Terrazzo Quotation Pro — pricing presets
-- HOW TO APPLY:
--   1) Open https://supabase.com/dashboard/project/tlzrmbedscmnmuzhfwkh/sql/new
--   2) Paste this entire file and Run.
-- Re-runnable: uses IF NOT EXISTS / DROP POLICY IF EXISTS.
-- ============================================================

create table if not exists public.pricing_presets (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users(id) on delete cascade,
  name        text not null,
  is_public   boolean not null default false,
  config      jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Data API grants (PostgREST requires explicit grants)
grant select on public.pricing_presets to anon;
grant select, insert, update, delete on public.pricing_presets to authenticated;
grant all on public.pricing_presets to service_role;

-- Row-Level Security
alter table public.pricing_presets enable row level security;

drop policy if exists "anyone reads public presets" on public.pricing_presets;
create policy "anyone reads public presets"
  on public.pricing_presets for select
  using (is_public = true);

drop policy if exists "owner reads own presets" on public.pricing_presets;
create policy "owner reads own presets"
  on public.pricing_presets for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "owner inserts own presets" on public.pricing_presets;
create policy "owner inserts own presets"
  on public.pricing_presets for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "owner updates own presets" on public.pricing_presets;
create policy "owner updates own presets"
  on public.pricing_presets for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "owner deletes own presets" on public.pricing_presets;
create policy "owner deletes own presets"
  on public.pricing_presets for delete
  to authenticated
  using (owner_id = auth.uid());

-- updated_at trigger
create or replace function public.touch_pricing_presets_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_pricing_presets_touch on public.pricing_presets;
create trigger trg_pricing_presets_touch
  before update on public.pricing_presets
  for each row execute function public.touch_pricing_presets_updated_at();

-- ============================================================
-- Seed: one public "Default" preset matching the app's built-in values.
-- Safe to re-run; only inserts when no Default exists yet.
-- ============================================================
insert into public.pricing_presets (owner_id, name, is_public, config)
select null, 'Default', true, '{"styles":[{"id":"fine","name":"Fine Aggregate","description":"Small stone chips for a smooth, elegant finish","materialsRate":18926,"labourRate":8043,"active":true,"sort":0},{"id":"medium","name":"Medium Aggregate","description":"Medium stone chips for a balanced, classic look","materialsRate":22000,"labourRate":9500,"active":true,"sort":1},{"id":"bold","name":"Bold Aggregate","description":"Large stone chips for a dramatic, bold appearance","materialsRate":26000,"labourRate":11000,"active":true,"sort":2},{"id":"custom","name":"Custom Mix","description":"Bespoke blend of aggregates tailored to your design","materialsRate":30000,"labourRate":13000,"active":true,"sort":3}],"patterns":[{"id":"plain","name":"Plain","description":"No pattern — clean, uniform surface","multiplier":1.0,"active":true,"sort":0},{"id":"divider","name":"Divider Strips","description":"Metal or brass divider strips between sections","multiplier":1.10,"active":true,"sort":1},{"id":"geometric","name":"Geometric Pattern","description":"Custom geometric shapes and designs","multiplier":1.25,"active":true,"sort":2},{"id":"custom","name":"Custom Pattern","description":"Fully bespoke pattern designed to your specification","multiplier":1.40,"active":true,"sort":3}],"materials":{"casting":[{"id":"c-stones-floor-white","name":"Stones floor white","unit":"bag","unitPrice":15000,"qtyOp":"divide","qtyFactor":2.8,"active":true,"sort":0},{"id":"c-stones-floor-black","name":"Stones floor black","unit":"bag","unitPrice":13000,"qtyOp":"divide","qtyFactor":24,"active":true,"sort":1},{"id":"c-stones-floor-red","name":"Stones floor red","unit":"bag","unitPrice":13000,"qtyOp":"divide","qtyFactor":33.6,"active":true,"sort":2},{"id":"c-stones-skirting-white","name":"Stones skirting white","unit":"bag","unitPrice":15000,"qtyOp":"divide","qtyFactor":4.662,"active":true,"sort":3},{"id":"c-stones-skirting-black","name":"Stones skirting black","unit":"bag","unitPrice":13000,"qtyOp":"divide","qtyFactor":25.43,"active":true,"sort":4},{"id":"c-stones-skirting-red","name":"Stones skirting red","unit":"bag","unitPrice":13000,"qtyOp":"divide","qtyFactor":69.93,"active":true,"sort":5},{"id":"c-stips","name":"Stips","unit":"bundle","unitPrice":60000,"qtyOp":"divide","qtyFactor":26.67,"active":true,"sort":6},{"id":"c-soft-brush","name":"Soft brush","unit":"each","unitPrice":12000,"qtyOp":"divide","qtyFactor":16,"active":true,"sort":7},{"id":"c-black-oxide","name":"Black oxide","unit":"kg","unitPrice":15000,"qtyOp":"multiply","qtyFactor":0.25,"active":true,"sort":8},{"id":"c-concrete-nails","name":"Concrete nails","unit":"box","unitPrice":5000,"qtyOp":"divide","qtyFactor":26.67,"active":true,"sort":9},{"id":"c-wooden-strips","name":"Wooden strips","unit":"each","unitPrice":1000,"qtyOp":"divide","qtyFactor":2.67,"active":true,"sort":10},{"id":"c-ordinary-cement","name":"Ordinary cement","unit":"bag","unitPrice":33000,"qtyOp":"divide","qtyFactor":4,"active":true,"sort":11},{"id":"c-white-cement","name":"White cement","unit":"bag","unitPrice":65000,"qtyOp":"divide","qtyFactor":8,"active":true,"sort":12}],"grinding":[{"id":"g-big-machine-pads","name":"Big machine diamond pads","unit":"set","unitPrice":150000,"qtyOp":"divide","qtyFactor":115,"active":true,"sort":0},{"id":"g-grinder-pads","name":"Grinder diamond pads","unit":"piece","unitPrice":60000,"qtyOp":"divide","qtyFactor":115,"active":true,"sort":1},{"id":"g-pads-50","name":"Pads 50 grit","unit":"pad","unitPrice":20000,"qtyOp":"divide","qtyFactor":77,"active":true,"sort":2},{"id":"g-pads-100","name":"Pads 100 grit","unit":"pad","unitPrice":20000,"qtyOp":"divide","qtyFactor":115,"active":true,"sort":3},{"id":"g-pads-200","name":"Pads 200 grit","unit":"pad","unitPrice":20000,"qtyOp":"divide","qtyFactor":115,"active":true,"sort":4},{"id":"g-pads-300","name":"Pads 300 grit","unit":"pad","unitPrice":20000,"qtyOp":"divide","qtyFactor":115,"active":true,"sort":5},{"id":"g-pads-400","name":"Pads 400 grit","unit":"pad","unitPrice":20000,"qtyOp":"divide","qtyFactor":115,"active":true,"sort":6},{"id":"g-pads-500","name":"Pads 500 grit","unit":"pad","unitPrice":20000,"qtyOp":"divide","qtyFactor":230,"active":true,"sort":7},{"id":"g-grinder-holder","name":"Grinder pad holder","unit":"each","unitPrice":15000,"qtyOp":"divide","qtyFactor":57.5,"active":true,"sort":8},{"id":"g-machine-holder","name":"Machine pad holder","unit":"each","unitPrice":15000,"qtyOp":"divide","qtyFactor":57.5,"active":true,"sort":9},{"id":"g-squeezer","name":"Squeezer","unit":"each","unitPrice":10000,"qtyOp":"divide","qtyFactor":76.7,"active":true,"sort":10},{"id":"g-polish","name":"Polish","unit":"liter","unitPrice":20000,"qtyOp":"multiply","qtyFactor":0.087,"active":true,"sort":11},{"id":"g-maintainer","name":"Maintainer","unit":"liter","unitPrice":10000,"qtyOp":"multiply","qtyFactor":0.174,"active":true,"sort":12}]}}'::jsonb
where not exists (
  select 1 from public.pricing_presets where is_public = true and name = 'Default'
);
