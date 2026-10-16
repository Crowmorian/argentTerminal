import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
const allowed = new Set(['index.html', 'key.html', 'styles.css', 'terminal.js', 'key.js', 'puzzle.js', 'puzzle-config.js']);
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!allowed.has(file)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const data = await readFile(path.join(root, file));
    res.writeHead(200, { 'Content-Type': `${types[path.extname(file)] || 'application/octet-stream'}; charset=utf-8`, 'Cache-Control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Invalid request');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Argent Terminal: http://127.0.0.1:${port}`));
