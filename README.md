# Travel Stories — Discover India (Bolt)

Interactive India travel discovery app: state → district → tourist spot maps,
nearby-spot distances, stays, plus a curated tour-package marketplace. Built
with React + TypeScript + Vite + Tailwind, a **PHP + MariaDB backend**
(`api/`), no Supabase. Hosted on `trvlstory.reddevils.co.in` (cPanel);
see `docs/HOSTING.md`.

## Quick start (local preview, no accounts needed)

```bash
npm install
npm run build
python3 scripts/make_preview.py   # dist + api + SQLite DB into preview/
php -S localhost:8080 -t preview
```

Open http://localhost:8080 — full site with all 36 states.

| Script          | Purpose                          |
| --------------- | -------------------------------- |
| `npm run dev`   | Vite dev server (proxies /api → localhost:8080) |
| `npm run build` | Type-check (`tsc -b`) + prod build |
| `npm run preview` | Preview the production build   |
| `npm run lint`  | Lint with Oxlint                 |

## Backend + database

- `api/*.php` — read-only catalogue endpoints + `inquire.php` (POST).
  Same code runs locally (SQLite) and on cPanel (MySQL) via `config.php`.
- `database/schema.mysql.sql` / `schema.sqlite.sql`, portable `seed.sql`
  (generated: `python3 scripts/seed_convert.py`).
- `config/config.sample.php` → copy to `config.php` (git-ignored; on the
  server it lives outside the docroot — see `docs/HOSTING.md`).
- The `supabase/` folder is kept only as the content source of truth for
  regenerating `seed.sql`; the app no longer depends on Supabase.

## Database

Schema + seed data live in `supabase/migrations/`:

- `create_travel_stories_schema` — states, districts, tourist_spots, accommodations
- `seed_travel_data` — first 5 states (Kerala, Rajasthan, Goa, Himachal, Tamil Nadu)
- `fix_map_data_mismatches` — renames seeded districts to match map data
  (`Pushkar`→`Ajmer`, `Kanniyakumari`→`Kanyakumari`)
- `seed_remaining_states` — remaining 31 states/UTs (114 spots, 28 stays);
  district names match TopoJSON `district` properties exactly
- `create_agent_marketplace_schema` — travel_agents, travel_packages
- `seed_agent_marketplace_data` — 4 agents, 10 packages

Apply with Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

All tables are public-read (anon SELECT) via RLS; writes happen via migrations only.

## Project structure

- `src/App.tsx` — tabs (Map Explorer / Tour Packages), view state machine
- `src/components/IndiaMap.tsx` — country map (react-simple-maps + d3-geo)
- `src/components/StateMap.tsx` — district map + spot list
- `src/components/SpotDetail.tsx` — nearby distances, accommodations
- `src/components/Marketplace.tsx` / `PackageModal.tsx` — packages + inquiry form
- `src/lib/data.ts` — API queries + haversine distance helpers
- `src/lib/api.ts` — fetch wrapper (`VITE_API_BASE`, default same-origin `/api`)
- `src/lib/mapData.ts` — TopoJSON CDN URLs (udit-001/india-maps-data)

## Map data

State/district geometry comes from `udit-001/india-maps-data` via jsDelivr
(see `src/lib/mapData.ts`). Notes:

- All 36 states/UTs in `india.json` are mapped; Tamil Nadu's file is
  `tamilnadu.json` (no hyphen).
- `StateMap` centers every state (`getCenter`) and zooms small states/UTs
  (`getScale`, e.g. Chandigarh 30000, Delhi 12000).

## Pending / known gaps

- Seed data has `image_url` only for `travel_packages`; states / spots /
  accommodations have the column but no seeded images, so those fall back to
  colored placeholders.
- Package inquiries are stored in the `inquiries` table via `api/inquire.php`;
  accommodation "Book Now" buttons are still UI-only.
- `StateMap.getCenter()` has tuned centers for 5 seeded states; other states
  fall back to the India-wide center.
