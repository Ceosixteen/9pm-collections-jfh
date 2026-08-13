import path from 'path';
import { existsSync } from 'fs';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createApp, startTelegramPolling } from './api/_lib/app.js';

async function startServer() {
  const app = createApp();
  const PORT = 3000;

  // Vite Middleware / Static setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      // Prefer a pre-rendered index.html for this exact route (baked-in SEO/
      // Open Graph tags per page) when one exists, matching how Vercel's
      // static file resolution serves dist/<route>/index.html directly.
      const routedIndex = path.join(distPath, req.path.replace(/\/$/, ''), 'index.html');
      if (req.path !== '/' && existsSync(routedIndex)) {
        return res.sendFile(routedIndex);
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Long-polling only makes sense for a persistent local/traditional host;
  // the Vercel deployment uses the /api/telegram/webhook route instead.
  startTelegramPolling();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 Juba Fashion Hub Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
