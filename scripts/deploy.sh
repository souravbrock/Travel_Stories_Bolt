#!/usr/bin/env bash
# Deploy the production build + PHP API to the cPanel subdomain via SSH.
# Prerequisites: npm run build has been run locally; subdomain docroot and
# DB/config already created once (see docs/HOSTING.md).
# Usage (Git Bash on Windows):  bash scripts/deploy.sh
set -euo pipefail
KEY="C:/Users/soura/.ssh/cpanel-deploy"
HOST="reddevil@kaveri.domainadda.com"
DOCROOT="/home/reddevil/public_html/trvlstory.reddevils.co.in"

npm run build
ssh -i "$KEY" "$HOST" "mkdir -p $DOCROOT/api/auth $DOCROOT/api/vendor $DOCROOT/api/admin"
scp -i "$KEY" -r dist/* "$HOST:$DOCROOT/"
scp -i "$KEY" api/*.php "$HOST:$DOCROOT/api/"
scp -i "$KEY" api/auth/*.php "$HOST:$DOCROOT/api/auth/"
scp -i "$KEY" api/vendor/*.php "$HOST:$DOCROOT/api/vendor/"
scp -i "$KEY" api/admin/*.php "$HOST:$DOCROOT/api/admin/"
scp -i "$KEY" deploy/htaccess "$HOST:$DOCROOT/.htaccess"
# scp-created dirs can land as 700 (Apache then 403s) — normalize.
ssh -i "$KEY" "$HOST" "chmod 755 $DOCROOT/assets $DOCROOT/api/auth $DOCROOT/api/vendor $DOCROOT/api/admin && chmod 644 $DOCROOT/assets/*"
echo "Deployed. Verify: https://trvlstory.reddevils.co.in/api/health.php"
