# Hosting on trvlstory.reddevils.co.in (cPanel, DomainAdda)

Architecture: **static Vite build + PHP 8.2 API + MariaDB**. No Supabase, no
Node process on the server. The subdomain docroot serves `dist/*` and
`/api/*.php` from one origin, so the frontend needs no API keys.

```
trvlstory.reddevils.co.in/      <- dist/* (index.html, assets, favicon)
trvlstory.reddevils.co.in/api/  <- api/*.php
trvlstory.reddevils.co.in/.htaccess (from deploy/htaccess)
/home/reddevil/trvlstory-config/config.php  <- DB credentials (OUTSIDE docroot)
```

## One-time setup (cPanel UI)

1. **Subdomain**: Domains → Create a New Domain →
   `trvlstory.reddevils.co.in`, document root
   `/home/reddevil/trvlstory.reddevils.co.in`. AutoSSL covers it (SSL is
   active on this account).
2. **Database**: Database Wizard → database `reddevil_trvlstory` → user
   `reddevil_trvluser` (strong password) → grant ALL PRIVILEGES.
3. **Schema + data**: phpMyAdmin → select `reddevil_trvlstory` → Import →
   `database/schema.mysql.sql`, then Import → `database/seed.sql`.
   Expect: 36 states, 92 districts, 154 spots, 75 stays, 4 agents, 10 packages.
4. **Config**: File Manager (or SSH) → create
   `/home/reddevil/trvlstory-config/` → upload `config/config.sample.php`
   as `config.php` → fill in db host/name/user/pass → permissions 600.

## Deploy / update

```bash
npm run build
bash scripts/deploy.sh     # copies dist + api + .htaccess over SSH
```

Then verify `https://trvlstory.reddevils.co.in/api/health.php` returns
`{"ok":true,...}` and the homepage loads the India map.

## Local preview (before pushing to hosting)

```bash
npm run build
python3 scripts/make_preview.py   # builds preview/ with local SQLite DB
php -S localhost:8080 -t preview  # portable PHP is fine
```

Open http://localhost:8080 — same code, same data shape as production.

## Regenerating the seed

`database/seed.sql` is generated from `supabase/migrations/` (kept as the
content source of truth):

```bash
python3 scripts/seed_convert.py   # rewrite database/seed.sql
python3 scripts/validate_seed.py  # row counts + FK + JSON sanity checks
```
