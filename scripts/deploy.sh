#!/usr/bin/env bash
# Deploy the production build + PHP API to the cPanel subdomain via SSH.
# Prerequisites: npm run build has been run locally; subdomain docroot and
# DB/config already created once (see docs/HOSTING.md).
# Usage (Git Bash on Windows):  bash scripts/deploy.sh
set -euo pipefail
KEY="C:/Users/soura/.ssh/cpanel-deploy"
HOST="reddevil@kaveri.domainadda.com"
DOCROOT="/home/reddevil/trvlstory.reddevils.co.in"

npm run build
ssh -i "$KEY" "$HOST" "mkdir -p $DOCROOT/api"
scp -i "$KEY" -r dist/* "$HOST:$DOCROOT/"
scp -i "$KEY" -r api/*.php "$HOST:$DOCROOT/api/"
scp -i "$KEY" deploy/htaccess "$HOST:$DOCROOT/.htaccess"
echo "Deployed. Verify: https://trvlstory.reddevils.co.in/api/health.php"
