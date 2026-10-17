import test from 'node:test';
import assert from 'node:assert/strict';
import { puzzle } from '../puzzle-config.js';

let moduleInstance = 0;

// A small DOM fixture exercises the shared page script, not browser layout.
function prepareRecord(t, { id, search = '', clipboard = 'working' } = {}) {
  function element() {
    const classes = new Set();
    const listeners = new Map();
    return {
      textContent: '', hidden: true, children: [],
      classList: { add: name => classes.add(name), contains: name => classes.has(name) },
      addEventListener(name, callback) { listeners.set(name, callback); },
      click() { return listeners.get('click')?.(); },
      replaceChildren(...children) { this.children = children; }
    };
  }
  const ids = ['key-title', 'key-error', 'key-activation', 'key-sequence', 'key-protocol', 'key-status', 'key-data', 'copy-button', 'copy-status'];
  const nodes = Object.fromEntries(ids.map(id => [`#${id}`, element()]));
  const body = { dataset: id ? { key: id } : {}, classList: element().classList };
  const copied = [];
  const document = { title: '', body, querySelector: selector => nodes[selector], createElement: element };
  const navigator = clipboard === 'unavailable' ? {} : {
    clipboard: { async writeText(value) {
      if (clipboard === 'denied') throw new Error('Clipboard access denied');
      copied.push(value);
    } }
  };
  for (const [name, value] of Object.entries({ document, navigator, location: { search } })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, name, previous);
      else delete globalThis[name];
    });
  }
  return {
    nodes, document, copied,
    load: () => import(`../key.js?test=${++moduleInstance}`)
  };
}

for (const key of puzzle.keys) {
  test(`${key.name} route displays and copies its own record despite another query key`, async t => {
    const page = prepareRecord(t, { id: key.id, search: `?key=${puzzle.keys.find(item => item.id !== key.id).id}` });
    await page.load();
    assert.equal(page.nodes['#key-title'].textContent, key.name);
    assert.equal(page.nodes['#key-sequence'].textContent, key.sequence);
    assert.equal(page.nodes['#key-protocol'].textContent, key.protocol);
    assert.deepEqual(page.nodes['#key-status'].children.map(line => line.textContent), key.status);
    assert.equal(page.nodes['#key-data'].hidden, false);
    assert(page.document.body.classList.contains('record-recognized'));
    assert.equal(page.nodes['#copy-button'].hidden, false);
    await page.nodes['#copy-button'].click();
    assert.deepEqual(page.copied, [key.sequence]);
    assert.equal(page.nodes['#copy-status'].textContent, 'IDENTIFIER COPIED');
  });
}

test('existing NFC query links still select the correct authority', async t => {
  const page = prepareRecord(t, { search: '?key=sec' });
  await page.load();
  assert.equal(page.nodes['#key-sequence'].textContent, puzzle.keys.find(key => key.id === 'sec').sequence);
});

test('an unknown key reveals no record or identifier', async t => {
  const page = prepareRecord(t, { search: '?key=unknown' });
  await page.load();
  assert.equal(page.nodes['#key-data'].hidden, true);
  assert.equal(page.nodes['#key-error'].hidden, false);
  assert.equal(page.nodes['#key-sequence'].textContent, '');
});

test('clipboard denial leaves the identifier readable and gives a manual-copy fallback', async t => {
  const page = prepareRecord(t, { id: 'cmd', clipboard: 'denied' });
  await page.load();
  await page.nodes['#copy-button'].click();
  assert.equal(page.nodes['#key-sequence'].textContent, puzzle.keys.find(key => key.id === 'cmd').sequence);
  assert.equal(page.nodes['#copy-status'].textContent, 'Select and copy the identifier above.');
});

test('without clipboard support the record remains readable', async t => {
  const page = prepareRecord(t, { id: 'bio', clipboard: 'unavailable' });
  await page.load();
  assert.equal(page.nodes['#copy-button'].hidden, true);
  assert.equal(page.nodes['#key-data'].hidden, false);
});
