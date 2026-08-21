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
DEPLOY_OUTPUT=$(npx vercel --prod --yes 2>&1)
echo "$DEPLOY_OUTPUT"
DEPLOY_URL=$(printf '%s\n' "$DEPLOY_OUTPUT" | grep -Eo 'https://[^[:space:]]+\.vercel\.app' | tail -1)

if [ -z "$DEPLOY_URL" ]; then
  echo "❌ Could not determine deployment URL. Check Vercel output above."
  exit 1
fi

echo "✅ Deployed to: $DEPLOY_URL"
echo ""
echo "🔗 Aliasing jubafashionhub.link..."
npx vercel alias set "$DEPLOY_URL" jubafashionhub.link

echo "🔗 Aliasing admin.jubafashionhub.link..."
npx vercel alias set "$DEPLOY_URL" admin.jubafashionhub.link

echo ""
echo "🎉 Done! Both domains now point to $DEPLOY_URL"
