import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const allowed = new Set([
  'index.html', 'key.html', 'styles.css', 'terminal.js', 'key.js', 'puzzle.js', 'puzzle-config.js',
  'assets/slayer-rune.png', 'assets/fonts/barlow-condensed-600.woff2',
  'assets/fonts/cinzel-600.woff2', 'assets/fonts/ibm-plex-mono-400.woff2',
  'security/index.html', 'biolab/index.html', 'engineering/index.html',
  'armory/index.html', 'command/index.html',
  'quiz/index.html', 'quiz/quiz.css', 'quiz/quiz.js', 'quiz/quiz-data.js', 'quiz/quiz-session.js',
  'image-game/index.html', 'image-game/game.css', 'image-game/game.js',
  'image-game/game-data.js', 'image-game/game-session.js',
  'image-game/images/image1.jpg', 'image-game/images/image2.jpg', 'image-game/images/image3.jpg'
]);
const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(requestUrl.pathname);
    const file = pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : pathname.slice(1);
    if (allowed.has(`${file}/index.html`)) {
      res.writeHead(302, { Location: `${pathname}/${requestUrl.search}` });
      res.end();
      return;
    }
    if (!allowed.has(file)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const data = await readFile(path.join(root, file));
    const type = types[path.extname(file)] || 'application/octet-stream';
    const charset = type.startsWith('text/') || type === 'image/svg+xml' ? '; charset=utf-8' : '';
    res.writeHead(200, { 'Content-Type': `${type}${charset}`, 'Cache-Control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Invalid request');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Argent Terminal: http://127.0.0.1:${port}`));
