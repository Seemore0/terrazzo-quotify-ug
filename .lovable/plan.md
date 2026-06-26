## Goal
Transform the existing Terrazzo Quotation app into a production SaaS for Ugandan contractors with full CRM, quotation history, analytics, PDF/WhatsApp/email sharing, audit trails, PWA support, and hardened security.

## Prerequisite (blocker)
Backend work (quotations table, customers, audit trail, RLS, edge functions for email/PDF storage) requires a live database. The project is currently wired to an external Supabase project (`tlzrmbedscmnmuzhfwkh`) that I cannot run migrations against. Two options:

- **A. Enable Lovable Cloud** — I can run all migrations and deploy edge functions directly. Requires topping up credits (previously blocked). Existing `pricing_presets` data won't carry over, but nothing was actually created there yet.
- **B. Keep external Supabase** — I write all SQL into `db/` files; you paste each file into the Supabase SQL editor. Edge functions you'd deploy via Supabase CLI.

I'll assume **A (Lovable Cloud)** for the plan. Tell me if you want B.

## Build phases

### Phase 1 — Database schema (migrations)
- `customers` (id, name, phone UNIQUE, email, location, total_projects, total_spent, last_project_date, owner_id, timestamps)
- `quotations` (id, quote_number UNIQUE, customer_id FK, snapshot of customer fields, area_m2, floor_type, thickness, materials_json, total_cost, profit, status enum [draft|sent|approved|rejected|completed|archived], pdf_url, owner_id, timestamps)
- `quote_counters` (year int PK, last_seq int) + `next_quote_number(year)` SECURITY DEFINER fn → `TQ-YYYY-####`, unique even after delete
- `price_history` (material_name, old_price, new_price, changed_by, changed_at)
- `user_roles` + `app_role` enum + `has_role()` (admin-only pricing edits)
- RLS on every table; GRANTs per Lovable rules; triggers to maintain customer aggregates and log price changes

### Phase 2 — Data layer & hooks
- `useQuotations`, `useCustomers`, `useDashboardStats`, `usePriceHistory` (React Query)
- Migrate `presetContext` to use Supabase reads, keep localStorage fallback for offline

### Phase 3 — Pages & navigation
- App shell with sidebar: Dashboard / Quotes / Customers / Reports / Settings
- `/dashboard` — stat cards + monthly revenue chart (recharts)
- `/quotes` — list, filters (status/date/customer), search, actions (view/edit/duplicate/PDF/archive)
- `/quotes/:id` — detail + edit
- `/customers` — list + search
- `/customers/:id` — profile, quote history, "New quote" CTA
- `/reports` — exports (JSON/Excel via xlsx)
- `/settings` — existing admin tabs + price history audit log
- Global search command palette (cmd+k) over customers/quotes/phones/quote#s

### Phase 4 — Quotation wizard upgrades
- On submit: create/find customer by phone, allocate quote_number, persist quotation
- Status workflow buttons
- Duplicate quote action

### Phase 5 — PDF, WhatsApp, Email
- Rewrite jsPDF template: logo, quote #, customer block, itemized materials table (autotable), subtotal/tax/total, admin-toggle profit section, T&Cs, signature, footer contacts
- WhatsApp share: `https://wa.me/<phone>?text=<encoded summary + PDF link>`
- Email: edge function using Lovable scaffolded auth/transactional email infra (`send-transactional-email`) with PDF stored in Supabase Storage `quotes` bucket → signed URL in email

### Phase 6 — PWA + mobile
- Manifest + icons (manifest-only first; offline path only if you confirm offline quotation creation is needed — that adds sync-queue complexity)
- Mobile polish: sticky "Generate Quote" CTA, `inputMode="decimal"`, larger tap targets, skeleton loaders

### Phase 7 — Security & validation
- Zod schemas on every form
- RLS verified via test queries
- Admin role gating on `/settings` pricing tabs and price_history
- Run security scan at the end

## Technical notes
- Stack stays: React 18 + Vite + Tailwind + shadcn + TanStack Query + jsPDF + jspdf-autotable + recharts + xlsx + zod
- Quote number generation is atomic via Postgres function with row lock on `quote_counters`
- Customer aggregates (total_projects/total_spent/last_project_date) maintained by trigger on quotations
- Soft delete = `status='archived'`; list views exclude archived by default
- Offline mode: defer unless explicitly requested — true offline-with-sync is a multi-day project on its own

## Scope confirmations needed
1. **Backend**: Lovable Cloud (A) or keep external Supabase (B)?
2. **Offline PWA**: installable + works offline with sync queue (large effort) OR just installable home-screen app (fast)?
3. **Email**: set up Lovable Emails (needs domain) or skip for now?
4. **Logo**: do you have a logo file to use, or want me to generate a placeholder?

Once you confirm, I'll execute phases 1→7 in order, committing after each phase so you can preview progress.