# Database setup — Terrazzo Quotation Pro

Your Supabase project (**Nick**) needs one table for cloud-synced pricing presets.

## One-time setup (1 minute)

1. Open the Supabase SQL editor:
   <https://supabase.com/dashboard/project/tlzrmbedscmnmuzhfwkh/sql/new>
2. Open [`db/setup.sql`](./setup.sql) in this repo, copy everything.
3. Paste into the SQL editor and click **Run**.

The script:
- Creates the `pricing_presets` table
- Sets RLS so users can only edit their own presets
- Seeds a public **Default** preset matching the app's built-in values

Until you run it, the admin page will show a red banner and the app will fall back to the built-in default config (still fully usable, just not editable).

## What gets stored

A single row per preset with a JSONB `config` column containing:
- **styles** — list of terrazzo styles with name, description, materials & labour rates
- **patterns** — list of patterns with multipliers
- **materials.casting / materials.grinding** — each material's name, unit, unit price, and quantity formula (`area ÷ X` or `area × X`)

Edit anything in the `/admin` page once signed in.
