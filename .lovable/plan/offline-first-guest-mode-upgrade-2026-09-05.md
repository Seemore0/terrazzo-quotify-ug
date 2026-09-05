# Offline-first + Guest Mode Upgrade

Goal: a contractor installs the app once, turns off all internet, taps **Continue as Guest**, and does full quotations — create customers, quote, save, reopen, PDF, share — with no account.

Nothing about the calculations, material logic, presets, PDF layout, Android build, or the APK workflow changes.

## What you will see

1. **New welcome screen** on first open: Sign In / Create Account / Continue as Guest. Guest opens the app instantly, no email, no password, no internet.
2. **Everything works offline** — quotes, customers, materials, mixes, presets, settings, history, search, PDF, share. Data is stored on the device and survives closing the app or the phone killing it.
3. **A small status chip** in the top bar: "Offline", "Guest — saved on this device", or "Online • Synced".
4. **No forced login ever again.** Sign-in is only asked for when you tap something explicitly cloud-related.
5. **Signing up later keeps your guest work.** A "Create account & upload my data" action merges device data into the cloud instead of wiping it.

## Technical approach

### Local storage layer
- Add **Dexie (IndexedDB)** — pure JS, no new native plugin, so the existing Gradle/Capacitor Android build is untouched and it persists inside the Android WebView across restarts.
- New `src/lib/local/db.ts` defining tables that mirror the existing Supabase row shapes exactly (so existing components and types keep working): `customers`, `quotations`, `quotation_sections`, `mix_presets`, `pricing_presets`, `settings`, `sync_queue`.
- Every record carries `owner_id` (the guest id for local sessions), `updated_at`, and a `dirty` flag for later sync.

### Services (centralised, typed)
New `src/lib/local/`:
- `guestAuthService.ts` — creates/persists a stable local guest identity (`guest-<uuid>`), mode = `guest | cloud | signed-out`.
- `localCustomerService.ts`, `localQuotationService.ts` (incl. sections), `localPresetService.ts` (pricing + mix presets), `localMaterialService.ts`, `localSettingsService.ts`.
- `quoteNumberService.ts` — offline numbering `QT-YYMMDD-0001` via an atomic Dexie transaction on a local counter, unique per device; keeps the existing cloud numbering when signed in and online.
- `connectionService.ts` — online/offline signal (`navigator.onLine` + a cheap reachability probe), exposed via `useConnection()`.
- `syncService.ts` — for signed-in users only: push dirty local rows, pull remote changes, last-write-wins by `updated_at`, merge (never delete local rows).

### Repository swap in the existing hooks
`useCustomers`, `useQuotations`, `useQuotationSections`, `useMixPresets`, `presetsApi`/`presetContext` keep their exact public APIs and return types. Internally each call is routed:
- local read/write always happens first (so the UI never waits on the network);
- if session is cloud + online, the same change is queued for sync;
- any Supabase failure (`Failed to fetch`, auth session missing, timeout) is caught and swallowed — the local result is returned.

### Auth flow
- `src/pages/Welcome.tsx` with the three buttons; becomes the entry when there is no session and no guest session.
- `useAuth` extended with `mode`, `guestId`, `continueAsGuest()`, `isGuest`; it no longer blocks on `getSession()` — it resolves local state immediately and refreshes the cloud session in the background.
- `AppLayout` stops redirecting to `/auth`: it allows guest sessions through and renders instantly.
- Existing Sign In / Create Account / Google / reset-password screens stay exactly as they are.

### Seeding + PDF
- On first launch the built-in styles, patterns, material prices, formula factors and the 5 built-in mix presets are seeded into the local DB from the existing `presetTypes` defaults, so a fresh offline install has full data.
- `src/lib/pdf.ts` logic is untouched; jsPDF and fonts are already bundled. Any remote logo URL is replaced by a locally stored base64 logo in settings so PDFs render with no network.

### Cloud/admin surfaces in guest mode
- Admin settings, presets and company info write to local settings for guests (previously required sign-in).
- Cloud-only actions (share to team, cloud backup) show a single inline "Sign in to sync" prompt instead of redirecting.

## Validation
- `npm run build` plus a TypeScript check must pass clean.
- Browser test with network forced offline: guest entry, create customer, create + save quote, reload, reopen quote, edit, duplicate, delete, generate PDF.
- Confirm the Android workflow file and Capacitor config need no changes (verified: no `android/` folder is committed; the workflow generates it, and no new native plugin is added).
