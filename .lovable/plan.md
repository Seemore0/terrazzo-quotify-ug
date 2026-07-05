# Terrazzo Quotation Engine v2 — Multi-Section + Custom Mixes

Replaces the current 5-step wizard with a new multi-section flow while keeping the existing calculation, PDF, and DB compatible for old records.

## What we're building

1. **Two-section quotes** — every new quote has a Main Floor section and an optional Skirting section, each with its own dimensions, style, pattern, colour, and material mix.
2. **Quantity-only custom mixes** — bags / kg entered directly for Stones (white/black/red/other), Cement (white/OPC), Oxides (black/red/yellow/green/blue/other), plus wooden strips and other materials.
3. **Mix presets library** — built-in defaults + per-user saved mixes, loadable into any section.
4. **One labour calculation** across combined area, using existing labour rate logic.
5. **Professional PDF** with separated Floor / Skirting breakdowns and combined totals.
6. **Backward compatible** — existing quotations continue to display and calculate using the current single-section engine.

## New wizard flow (replaces current 5 steps)

```text
1. Client & Project    Name, phone, location, notes
2. Main Floor          Area (m² or ft²), thickness, style, pattern, colour, mix editor
3. Skirting (optional) Height (mm) × wall length (m) → area, or manual area,
                       style, pattern, colour, mix editor
4. Labour & Extras     Work mode, transport, profit %, notes
                       (labour rate × (floor area + skirting area))
5. Review & Generate   Combined summary, PDF, WhatsApp, save
```

A "Skip skirting" toggle keeps step 3 optional. Each section has a **Load preset** / **Save as preset** button next to the mix editor.

## Mix editor (Quantity mode)

Grouped inputs, all in bags/kg with running subtotal per group:

- Stones (bags): White, Black, Red, Other
- Cement (bags): White, Ordinary Portland
- Oxides (kg): Black, Red, Yellow, Green, Blue, Other
- Other materials: Wooden strips, Stips, Nails, Soft brush (auto-suggested from area but editable)

Validation: no negative values; oxide total ≤ reasonable cap (warn if > 2 kg/m²); at least one stone entry > 0.

## Database (new tables, existing untouched)

- `quotation_sections` — one row per section (`floor` | `skirting`) of a quote:
  - `quote_id`, `kind`, `area_m2`, `height_mm`, `wall_length_m`, `thickness_mm`,
    `style_id`, `pattern_id`, `colour`, `rate_per_m2`, `materials_cost`,
    `mix_jsonb` (all quantities), `sort`
- `mix_presets` — reusable mixes:
  - `owner_id` (nullable → built-in), `name`, `kind` (`floor` | `skirting` | `any`),
    `mix_jsonb`, `is_builtin`
- RLS: sections inherit access from parent quote (owner_id via join policy);
  mix_presets readable when `is_builtin OR owner_id = auth.uid()`, writable only by owner.
- Seed 5 built-ins: Pure White, Black & White, Red Decorative, Hospital White, School Standard.

`quotations` table gets two optional columns for aggregate display without breaking old rows:
- `has_sections` boolean default false
- `transport_cost` numeric default 0, `profit_pct` numeric default 0

Existing single-section quotes keep working through the current `materials`/`style_id`/`pattern_id` columns; new quotes set `has_sections = true` and read from `quotation_sections`.

## Calculation

```text
floorArea      = section(floor).area_m2
skirtingArea   = section(skirting).area_m2 or 0
totalArea      = floorArea + skirtingArea

floorMaterials    = sum(mix line items × unit prices)  ← from active preset prices
skirtingMaterials = sum(mix line items × unit prices)

labourCost   = totalArea × labourRate(style, pattern, workMode)
transport    = user input
profit       = (materials + labour + transport) × profit_pct / 100
grandTotal   = materials + labour + transport + profit
```

Unit prices for stones/cement/oxides continue to come from the active pricing preset (`pricing_presets.config.materials`), so admin price edits still cascade.

## PDF

Extend `src/lib/pdf.ts` to render, when `has_sections`:

```text
MAIN FLOOR
  Area: 42 m² · Thickness 40 mm · Style: Bold · Colour: Grey
  Materials
    - White stones ................. 10 bags × 15,000 = 150,000
    - Black oxide .................. 2 kg  × 15,000 =  30,000
    ...
  Floor subtotal ................................... 620,000

SKIRTING
  Area: 6.5 m² (100 mm × 65 m) · Style: Bold · Colour: Grey
  Materials
    ...
  Skirting subtotal ................................  95,000

LABOUR (48.5 m² combined) ..........................  430,000
Transport ..........................................   50,000
Profit (15%) ....................................... 179,250
GRAND TOTAL ....................................... 1,374,250
```

Old quotes fall back to the current single-table PDF.

## Files

**New**
- `src/lib/mixTypes.ts` — mix schema, quantity types, validators
- `src/lib/sectionCalc.ts` — section + combined totals
- `src/components/wizard/FloorSection.tsx`
- `src/components/wizard/SkirtingSection.tsx`
- `src/components/wizard/LabourExtras.tsx`
- `src/components/wizard/ReviewSection.tsx`
- `src/components/mix/MixEditor.tsx`
- `src/components/mix/MixPresetPicker.tsx`
- `src/hooks/useQuotationSections.ts`
- `src/hooks/useMixPresets.ts`
- `supabase/migrations/*_sections_and_mixes.sql`

**Edited**
- `src/components/QuotationApp.tsx` — new step orchestration
- `src/components/LiveSummary.tsx` — combined summary
- `src/hooks/useQuotations.ts` — create with sections
- `src/lib/pdf.ts` — sectioned layout with fallback
- `src/lib/schemas.ts` — section + mix zod schemas
- `src/pages/CustomerProfile.tsx`, `Quotes.tsx` — display combined totals

**Untouched (backward compat)**
- All existing quotation rows, admin pricing presets editors, dashboard queries.

## Technical notes

- Sections stored as separate rows keeps queries simple and lets us later add multi-room quotes without another migration.
- All mix values live inside `mix_jsonb` on each section — flexible, no per-material columns to migrate when the mix schema grows.
- Zod schemas validate on the client, and a Postgres trigger on `quotation_sections` re-checks non-negative numbers and total-percentage bounds server-side.
- Mobile: mix editor uses the existing card-style responsive pattern from the admin editors (`useIsMobile` split), sticky "Next" button on section steps.

## Rollout order

1. Migration (tables, RLS, GRANTs, built-in mix seeds).
2. Types + calc utilities + zod.
3. Mix editor + preset picker (isolated, testable).
4. New wizard steps replacing current step components.
5. PDF + save flow wiring.
6. Read-path updates for lists / customer profile.
7. Smoke test old quote view, new quote create, PDF, WhatsApp.