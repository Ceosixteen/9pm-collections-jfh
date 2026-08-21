#!/usr/bin/env bash
# deploy.sh — single command to build, deploy to Vercel, and alias BOTH
# custom domains (jubafashionhub.link + admin.jubafashionhub.link) to the
# same new deployment. Run from the project root:
#
#   bash scripts/deploy.sh
#
# This replaces the need to manually call `vercel alias set` for each domain
# after every `vercel --prod` invocation.

set -e

echo "🏗  Building and deploying to Vercel production..."
npx vercel --prod --yes

# Newer Vercel CLI versions can return before the final URL line is printed.
# Resolve the newest production deployment from structured JSON instead of
# scraping human-readable terminal output, then wait until it is ready.
DEPLOY_URL=$(npx vercel list 9pm-collections-jfh --environment production --limit 1 --json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const d=JSON.parse(s).deployments?.[0];if(d?.url)process.stdout.write('https://'+d.url)})")

if [ -z "$DEPLOY_URL" ]; then
  echo "❌ Could not determine deployment URL. Check Vercel output above."
  exit 1
fi

npx vercel inspect "$DEPLOY_URL" --wait --timeout 5m

echo "✅ Deployed to: $DEPLOY_URL"
echo ""
echo "🔗 Aliasing jubafashionhub.link..."
npx vercel alias set "$DEPLOY_URL" jubafashionhub.link

echo "🔗 Aliasing admin.jubafashionhub.link..."
npx vercel alias set "$DEPLOY_URL" admin.jubafashionhub.link

echo ""
echo "🎉 Done! Both domains now point to $DEPLOY_URL"
