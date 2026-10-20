import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { imageGame } from '../image-game/game-data.js';

test('the image page counts down after loading, hides the image, reveals answers, and runs another round', async t => {
  const html = await readFile(new URL('../image-game/index.html', import.meta.url), 'utf8');
  function element() {
    const classes = new Set();
    const listeners = new Map();
    return {
      children: [], hidden: false, dataset: {}, attributes: {},
      get textContent() { return this.children.map(child => child.textContent).join(''); },
      set textContent(value) { this.children = [{ textContent: String(value) }]; },
      append(...children) { this.children.push(...children); },
      replaceChildren(...children) { this.children = children; },
      classList: { toggle(name, active) { if (active) classes.add(name); else classes.delete(name); }, contains: name => classes.has(name) },
      addEventListener(name, callback) { listeners.set(name, callback); },
      emit(name) { listeners.get(name)?.(); },
      setAttribute(name, value) { this.attributes[name] = value; },
      removeAttribute(name) { delete this[name]; delete this.attributes[name]; },
      focus() {}
    };
  }
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const nodes = Object.fromEntries(ids.map(id => [`#${id}`, element()]));
  const documentEvents = new Map();
  const windowEvents = new Map();
  let time = 0;
  let timerId = 0;
  const timers = new Map();
  const loads = [];
  class TestImage {
    set src(value) { this.source = value; loads.push(this); }
    decode() { return Promise.resolve(); }
  }
  const document = {
    hidden: false, body: element(), querySelector: selector => nodes[selector], createElement: element,
    addEventListener(name, callback) { documentEvents.set(name, callback); }
  };
  const replacements = {
    document, window: { addEventListener(name, callback) { windowEvents.set(name, callback); } },
    Image: TestImage, performance: { now: () => time },
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, at: time + delay }); return id; },
    clearTimeout(id) { timers.delete(id); }
  };
  for (const [name, value] of Object.entries(replacements)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
    t.after(() => { if (previous) Object.defineProperty(globalThis, name, previous); else delete globalThis[name]; });
  }
  function advance(duration) {
    const target = time + duration;
    while (true) {
      const next = [...timers].filter(([, timer]) => timer.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      time = next[1].at;
      timers.delete(next[0]);
      next[1].callback();
    }
    time = target;
  }
  async function settleLoad() {
    for (let index = 0; index < 5; index++) await Promise.resolve();
  }
  await import('../image-game/game.js?test=page-flow');
  assert.equal(nodes['#round-buttons'].children.length, 3);
  assert.equal(nodes['#hub-screen'].hidden, false);
  nodes['#round-buttons'].children[0].emit('click');
  assert.equal(nodes['#loading-screen'].hidden, false);
  assert.equal(nodes['#image-screen'].hidden, true);
  advance(60000);
  assert.equal(timers.size, 0);
  loads[0].onload();
  await settleLoad();
  assert.equal(nodes['#image-screen'].hidden, false);
  assert.equal(nodes['#round-image'].src, imageGame.rounds[0].src);
  assert.equal(nodes['#countdown'].textContent, '00:30');
  advance(1000);
  assert.equal(nodes['#countdown'].textContent, '00:29');
  advance(28999);
  assert.equal(nodes['#image-screen'].hidden, false);
  advance(1);
  assert.equal(nodes['#image-screen'].hidden, true);
  assert.equal(nodes['#round-image'].src, undefined);
  assert.equal(nodes['#questions-screen'].hidden, false);
  assert.equal(nodes['#question-list'].children.length, 5);
  assert.equal(nodes['#answer-list'].children.length, 0);
  advance(3600000);
  assert.equal(nodes['#questions-screen'].hidden, false);
  nodes['#answers-button'].emit('click');
  assert.equal(nodes['#answers-screen'].hidden, false);
  assert.equal(nodes['#answer-list'].children.length, 5);
  assert(nodes['#answer-list'].textContent.includes(imageGame.rounds[0].questions[0].answer));
  nodes['#hub-button'].emit('click');
  assert.equal(nodes['#hub-screen'].hidden, false);
  assert(nodes['#round-buttons'].children[0].textContent.includes('ANSWERS VIEWED'));
  nodes['#round-buttons'].children[1].emit('click');
  loads[1].onerror(new Error('Failed image'));
  await settleLoad();
  assert.equal(nodes['#loading-error-actions'].hidden, false);
  assert.equal(timers.size, 0);
  nodes['#retry-button'].emit('click');
  loads[2].onload();
  await settleLoad();
  assert.equal(nodes['#countdown'].textContent, '00:30');
  // Simulate suspended callbacks while the tab is in the background.
  time += 60000;
  documentEvents.get('visibilitychange')();
  assert.equal(nodes['#image-screen'].hidden, true);
  assert.equal(nodes['#questions-screen'].hidden, false);
  assert.equal(nodes['#round-image'].src, undefined);
  assert.equal(timers.size, 0);
});
