# Architecture — Fire Allowance Tracker

Technical reference for developers working in this codebase.

---

## Commands

```bash
npm start                          # Dev server at localhost:3000
npm run build                      # Production build (CI= suppresses warnings-as-errors)
npm test -- --watchAll=false       # Run tests once
```

---

## Environment

This is **Create React App**, not Next.js. Env vars use `REACT_APP_` prefix:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

Set these in `.env.local`.

---

## Stack

Create React App · React 18 · Supabase (auth + database) · date-fns · No TypeScript · Deployed on Vercel (`vercel.json` sets `CI= npm run build`)

---

## Navigation

Single-page tab model via `useState` in `App.jsx` — no React Router, no URL routing. `BottomNav` emits a tab key string; `App` renders the matching page component.

Tab keys: `dashboard`, `recalls`, `retain`, `standby`, `mand`, `spoilt`, `stations`, `profile`

---

## Auth

`src/hooks/useAuth.js` serves as both a hook and a context provider (`AuthProvider`). Holds `session`, `profile`, `loading`. Exposes `signIn`, `signUp`, `signOut`, `updateProfile`, `resetPassword`. The app must be wrapped in `<AuthProvider>` to consume `useAuth()` anywhere.

---

## Data Layer

`src/hooks/useClaims.js` is the single source of truth for all claim data. On mount it fetches all four claim types in parallel from Supabase. Exposes:

- `addRecall`, `addRetain`, `addStandby`, `addSpoilt`
- `markPaid(table, id, payNumber)` — `table` is the string table name
- `deleteClaim(table, id)`
- Computed `allClaims` (merged, sorted by date) and `stats` summary object

**Dead file:** `src/context/ClaimsContext.jsx` is an unused stub from early development. Do not use it.

---

## Station Data — Two Lists

| File | Contents | Used for |
|------|----------|----------|
| `src/lib/supabase.js` | `STATIONS` (id + name), `stationName(id)`, `RATES` | UI labels, allowance calculations |
| `src/data/stations.js` | Full station data with `lat`/`lng` | `useStationDistances` → OSRM API |

---

## Allowance Rates — Two Sets

- **Operational rates** (`RATES` in `src/lib/supabase.js`): km rate, mealies, retain amounts, spoilt meal — used when inserting claims.
- **ATO tax rates** (`TAX_SMALL_MEAL`, `TAX_LARGE_MEAL`, `TAX_KM_RATE` in `Dashboard.jsx`): used only for the Tax Information panel. Kept separate intentionally.

---

## Station Distances

`src/hooks/useStationDistances.js` fetches driving distances from a given station to all others. Checks the `station_distances` Supabase table first (cached per calendar year). If not cached, calls the public OSRM routing API and upserts results into the cache table.

---

## UI Components

`src/components/UI.jsx` — shared presentational layer:
- `ClaimRow`, `BottomSheet`, `ClaimDetailSheet`
- `StatusBadge`, `TypeBadge`, `EmptyState`, `LoadingScreen`
- `fmtAUD`, `fmtDate`

Styling uses CSS custom properties in `src/styles/global.css` with utility classes: `card`, `btn`, `field`, `grid-2`, `badge-*`, `stat`, `page`.

---

## Database Tables

`profiles`, `recalls`, `retain`, `standby`, `spoilt`, `station_distances`

All claim tables have `status` (`Pending` / `Paid` / `Disputed`), `pay_number`, and `user_id`. RLS enforces per-user access on all tables. The `recalls` table has a generated `total_km` column (`dist_home_km + dist_stn_km`).

Full schema: `supabase-schema.sql`

---

## Known Tech Debt

`src/pages/ClaimPages.jsx`: most claim type pages render a `<SimplePage>` placeholder. Only `StandbyForm` has real logic — and it uses hardcoded placeholder rates instead of `RATES`. These pages need to be built out.
