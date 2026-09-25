# Hosting on trvlstory.reddevils.co.in (cPanel, DomainAdda)

Architecture: **static Vite build + PHP 8.2 API + MariaDB**. No Supabase, no
Node process on the server. The subdomain docroot serves `dist/*` and
`/api/*.php` from one origin, so the frontend needs no API keys.

```
public_html/trvlstory.reddevils.co.in/  <- dist/* (index.html, assets, favicon)
public_html/trvlstory.reddevils.co.in/api/  <- api/*.php
public_html/trvlstory.reddevils.co.in/.htaccess (from deploy/htaccess)
/home/reddevil/trvlstory-config/config.php  <- DB credentials (OUTSIDE docroot)
```

## One-time setup (done 2026-09-25 via SSH + uapi)

1. **Subdomain**: `uapi SubDomain addsubdomain domain=trvlstory
   rootdomain=reddevils.co.in` → docroot
   `/home/reddevil/public_html/trvlstory.reddevils.co.in`. AutoSSL covered
   it the same day. (cPanel UI alternative: Domains → Create a New Domain.)
2. **Database**: `uapi Mysql create_database name=reddevil_trvlstory`,
   `create_user name=reddevil_trvluser`, `set_privileges_on_database ...
   privileges='ALL PRIVILEGES'`. (UI alternative: Database Wizard.)
3. **Schema + data**: imported `database/schema.mysql.sql` then
   `database/seed.sql` via `mysql` CLI (UI alternative: phpMyAdmin Import).
   Expect: 36 states, 92 districts, 154 spots, 75 stays, 4 agents, 10 packages.
4. **Config**: `/home/reddevil/trvlstory-config/config.php` (mode 600) with
   the db credentials.

## Deploy / update

Push to `feat/all-india-states` (or `main`) and the GitHub Actions workflow
`Deploy to cPanel` builds and uploads over FTPS automatically. One-time setup:

1. cPanel → **FTP Accounts** → Add FTP Account: login `trvldeploy`
   (full login `trvldeploy@trvlstory.reddevils.co.in`), strong password
   (save it), directory `public_html/trvlstory.reddevils.co.in`,
   quota Unlimited → Create.
2. Repo **Settings → Secrets and variables → Actions**: `FTP_HOST`
   (`ftp.reddevils.co.in`), `FTP_USERNAME`
   (`trvldeploy@trvlstory.reddevils.co.in`), `FTP_PASSWORD`.

Manual fallback (same files, over SSH):

```bash
npm run build
bash scripts/deploy.sh     # copies dist + api + .htaccess over SSH, fixes perms
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
