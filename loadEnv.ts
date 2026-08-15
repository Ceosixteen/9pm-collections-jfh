// Loads .env.local into process.env for local development only. Must be the
// very first import in server.ts (import order determines execution order
// for ES modules), so that anything api/_lib/app.ts reads from process.env
// at module-load time sees these values too — not just handlers that read
// process.env lazily at request time. Vercel's production runtime injects
// env vars before any module loads, so this file is never needed there.
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
