import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { quiz } from '../quiz/quiz-data.js';

test('the page locks each selection, reveals all results at the end, and restarts cleanly', async t => {
  // Exercise the real UI script with the IDs from the real HTML; no layout emulation.
  const html = await readFile(new URL('../quiz/index.html', import.meta.url), 'utf8');
  function element(tag = 'div') {
    const listeners = new Map();
    const classes = new Set();
    const node = {
      tagName: tag.toUpperCase(), children: [], hidden: false, disabled: false,
      dataset: {}, attributes: {}, checked: false,
      get className() { return [...classes].join(' '); },
      set className(value) { classes.clear(); value.split(' ').filter(Boolean).forEach(name => classes.add(name)); },
      classList: {
        contains: name => classes.has(name),
        toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); }
      },
      get textContent() { return this.children.map(child => child.textContent).join(''); },
      set textContent(value) { this.children = [{ textContent: String(value) }]; },
      append(...children) { this.children.push(...children); },
      replaceChildren(...children) { this.children = children; },
      addEventListener(name, callback) { listeners.set(name, callback); },
      emit(name, target = this) { listeners.get(name)?.({ target, preventDefault() {} }); },
      setAttribute(name, value) { this.attributes[name] = value; },
      focus() {},
      querySelector(selector) {
        const visit = children => {
          for (const child of children) {
            if (child.tagName?.toLowerCase() === selector) return child;
            const found = visit(child.children || []);
            if (found) return found;
          }
          return null;
        };
        return visit(this.children);
      }
    };
    return node;
  }
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const nodes = Object.fromEntries(ids.map(id => [`#${id}`, element()]));
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, writable: true, value: {
    title: '', querySelector: selector => nodes[selector], createElement: element,
    createTextNode: text => ({ textContent: String(text) })
  } });
  t.after(() => { if (previous) Object.defineProperty(globalThis, 'document', previous); else delete globalThis.document; });
  await import('../quiz/quiz.js?test=page-flow');
  assert.equal(nodes['#start-button'].disabled, false);
  assert.equal(nodes['#question-screen'].hidden, true);
  nodes['#start-button'].emit('click');
  const form = nodes['#question-form'];
  const options = nodes['#answer-options'];
  const next = nodes['#next-button'];
  for (let index = 0; index < quiz.questions.length; index++) {
    assert.equal(nodes['#question-title'].textContent, quiz.questions[index].text);
    assert.equal(nodes['#results-screen'].hidden, true);
    assert.equal(nodes['#results-list'].children.length, 0);
    assert.equal(options.children.length, 4);
    assert.equal(next.disabled, true);
    const currentId = form.dataset.questionId;
    form.emit('submit');
    assert.equal(form.dataset.questionId, currentId);
    // Alternate correct and incorrect answers to inspect both result forms.
    const selectedIndex = (quiz.questions[index].correctIndex + index % 2) % 4;
    const selected = options.children[selectedIndex].querySelector('input');
    selected.checked = true;
    form.emit('change', selected);
    assert.equal(next.disabled, false);
    assert(options.children[selectedIndex].classList.contains('is-selected'));
    assert(!options.textContent.includes('Correct answer'));
    form.emit('submit');
  }
  assert.equal(nodes['#question-screen'].hidden, true);
  assert.equal(nodes['#results-screen'].hidden, false);
  const results = nodes['#results-list'].children;
  assert.equal(results.length, 15);
  assert(results[0].textContent.includes('Correct'));
  assert(!results[0].textContent.includes('Correct answer'));
  assert(results[1].textContent.includes('Incorrect'));
  assert(results[1].textContent.includes('Correct answer'));
  assert(results[1].textContent.includes('Salem'));
  assert.equal(nodes['#final-score'].textContent, '8 out of 15');
  nodes['#restart-button'].emit('click');
  assert.equal(nodes['#start-screen'].hidden, false);
  assert.equal(nodes['#results-screen'].hidden, true);
  assert.equal(nodes['#results-list'].children.length, 0);
  assert.equal(nodes['#final-score'].textContent, '');
  nodes['#start-button'].emit('click');
  assert.equal(form.dataset.questionId, 'q1');
  assert.equal(next.disabled, true);
});
