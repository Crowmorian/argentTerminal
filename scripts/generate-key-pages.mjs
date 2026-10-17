// Authoring helper only. The committed HTML pages need no build on GitHub Pages.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { puzzle } from '../puzzle-config.js';
import { validatePuzzle } from '../puzzle.js';

validatePuzzle(puzzle);
const template = await readFile(new URL('../key.html', import.meta.url), 'utf8');
const routes = new Set();
function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
for (const key of puzzle.keys) {
  if (!/^[a-z][a-z0-9-]*$/.test(key.route) || routes.has(key.route)) {
    throw new Error('Every key needs a unique, safe route.');
  }
  routes.add(key.route);
  const name = escapeHtml(key.name);
  const page = template
    .replace('<title>Sentinel Authority Record | Argent D\'Nur</title>', `<title>${name} | Sentinel Authority Record</title>`)
    .replace('<body class="key-record">', `<body class="key-record" data-key="${key.id}">`)
    .replace('id="key-title">Presenting authority', `id="key-title">${name}`)
    .replaceAll('href="./', 'href="../')
    .replaceAll('src="./', 'src="../');
  const directory = new URL(`../${key.route}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('index.html', directory), page);
  console.log(`Created /${key.route}/`);
}
