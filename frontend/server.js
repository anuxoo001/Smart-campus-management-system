import express from 'express';
import compression from 'compression';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT) || 4173;
const app = express();

if (isProduction) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distPath = path.join(__dirname, 'dist');

  app.use(compression());
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.get('*', async (req, res) => {
    const url = req.originalUrl;
    const template = await fs.readFile(new URL('./index.html', import.meta.url), 'utf-8');
    const transformed = await vite.transformIndexHtml(url, template);
    res.status(200).set({ 'Content-Type': 'text/html' }).end(transformed);
  });
}

app.listen(port, () => {
  console.log(`Frontend server running on http://localhost:${port}`);
});
