# Expanded Admin Controls + Cloud-Synced Presets

Add fine-grained admin controls (material prices, calculation formulas, custom styles & patterns) and let users save/switch between named presets ("Residential", "Commercial", "Budget", etc.) synced across devices via login.

---

## What you'll be able to control in `/admin`

### 1. Terrazzo Styles (existing + expanded)
- Add new style rows, rename, delete
- Edit materials rate (UGX/m²)
- Edit labour rate (UGX/m²)
- Toggle active/inactive (hide from selector without deleting)

### 2. Patterns (existing + expanded)
- Add new patterns, rename, delete
- Edit multiplier (e.g. 1.10 = +10%)
- Toggle active/inactive

### 3. Material Unit Prices (NEW)
Two tables (Casting + Grinding), each row editable:
- Item name
- Unit label (bag, kg, liter, etc.)
- Price per unit (UGX)
- Add new rows / delete rows

### 4. Material Calculation Formulas (NEW)
For each material, edit the formula parameters:
- Type: `area ÷ X` or `area × X`
- Coefficient (the number you can adjust)
- Example: "Stones floor white" → `area ÷ 2` then × (5/7); expose both divisors

Approach: expose each formula as `{ operation: 'divide' | 'multiply', factor: number }` with a friendly label. Users adjust the factor without touching code.

### 5. Presets (NEW)
- Save the current full admin config as a named preset
- List, load, rename, duplicate, delete presets
- "Active preset" indicator shown on the quote wizard header
- Switch preset before generating a quote

---

## Persistence (Cloud-synced)

Backend is already connected (Supabase project "Nick"). I'll add:

- **Authentication**: email/password + Google sign-in (Lovable Cloud defaults)
- **Auth pages**: `/auth` (sign in / sign up), protected `/admin` route
- **Public quoting**: the main wizard stays usable without login — anonymous users use the default config and any "public" preset marked by an admin
- **Tables** (new):
  - `pricing_presets` — id, owner_id, name, is_default, is_public, created_at
  - `preset_styles` — preset_id, style_key, name, materials_rate, labour_rate, sort, active
  - `preset_patterns` — preset_id, pattern_key, name, multiplier, sort, active
  - `preset_materials` — preset_id, phase ('casting'|'grinding'), item_key, name, unit, unit_price, qty_operation, qty_factor, sort, active
- **RLS**: owners can CRUD their own presets; everyone can read presets marked `is_public`
- **Migration seed**: insert one "Default" public preset matching today's hardcoded values so nothing breaks for anonymous users

---

## UI changes

### `/admin` page restructured into tabs
```text
┌─────────────────────────────────────────┐
│  Active preset: [Residential ▼] [Save as…] [New] │
├─────────────────────────────────────────┤
│ [Styles] [Patterns] [Materials] [Formulas] │
├─────────────────────────────────────────┤
│   (editable table for current tab)      │
└─────────────────────────────────────────┘
```

Each tab is an editable table with inline add/delete row, edit-in-place, and a "Save changes" button that writes to the active preset.

### Wizard header
- Small preset selector chip (top-right) so you can switch presets per-quote without leaving the wizard
- Anonymous users see only public presets

### Auth
- "Sign in" button in header when logged out
- "Admin" link only visible when logged in
- `/admin` redirects to `/auth` if not logged in

---

## Migration path

- Default preset is seeded from your existing values — current users see no change
- The existing localStorage admin config is migrated once on first login into a private preset called "My Settings"
- After that, all reads/writes go through Supabase

---

## Files

- New: `supabase/migrations/*.sql` — tables, RLS, default preset seed
- New: `src/pages/Auth.tsx` — sign in / up
- New: `src/hooks/useAuth.ts` — session listener
- New: `src/lib/presets.ts` — preset CRUD + active-preset state
- Rewrite: `src/pages/AdminSettings.tsx` — tabs + preset switcher
- New: `src/components/admin/StylesEditor.tsx`, `PatternsEditor.tsx`, `MaterialsEditor.tsx`, `FormulasEditor.tsx`
- New: `src/components/PresetSwitcher.tsx` — used in wizard + admin headers
- Update: `src/lib/pricingConfig.ts`, `src/lib/materialCalculations.ts`, `src/components/LiveSummary.tsx`, `src/components/QuotationApp.tsx` — read from active preset instead of constants
- Update: `src/App.tsx` — `/auth` route, guard for `/admin`

---

## Out of scope (can add next)
- Per-quote one-off overrides (wastage %, transport, VAT) — best done as a "Project Settings" step in the wizard once presets are in
- Team sharing of private presets (today: yours-only or public-to-everyone)