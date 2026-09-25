# Travel Stories — Discover India (Bolt)

Interactive India travel discovery app: state → district → tourist spot maps,
nearby-spot distances, stays, plus a curated tour-package marketplace. Built
with React + TypeScript + Vite + Tailwind + Supabase.

## Quick start

```bash
npm install
cp .env.example .env   # then fill in your Supabase values
npm run dev
```

| Script          | Purpose                          |
| --------------- | -------------------------------- |
| `npm run dev`   | Start Vite dev server            |
| `npm run build` | Type-check (`tsc -b`) + prod build |
| `npm run preview` | Preview the production build   |
| `npm run lint`  | Lint with Oxlint                 |

## Environment

Required (see `.env.example`):

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key

Without these, the app renders a setup notice instead of crashing
(see `src/lib/supabase.ts`, `src/components/ConfigNotice.tsx`).

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
- `src/lib/data.ts` — Supabase queries + haversine distance helpers
- `src/lib/mapData.ts` — TopoJSON CDN URLs (udit-001/india-maps-data)
- `src/lib/supabase.ts` — lazy client, `isSupabaseConfigured` guard

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
- Package inquiry + accommodation "Book Now" are UI-only (no backend table).
- `StateMap.getCenter()` has tuned centers for 5 seeded states; other states
  fall back to the India-wide center.
