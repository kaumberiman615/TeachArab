import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import apiApp from './api/index.js';

async function main() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Mount API backend routes from api/index.ts
  app.use(apiApp);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    // Mount Vite in middleware mode for development
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Teach Arab server running on port ${port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
