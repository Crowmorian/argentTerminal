import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { soundGame } from '../sound-game/sound-data.js';

test('the page replays at configured volumes, locks text, stops old clips, and reveals all answers', async t => {
  const html = await readFile(new URL('../sound-game/index.html', import.meta.url), 'utf8');
  // No native audio controls: playback is controlled by our buttons, not a volume slider.
  assert(!/<audio\b[^>]*\bcontrols/i.test(html));
  function element() {
    const listeners = new Map();
    const classes = new Set();
    return {
      children: [], hidden: false, disabled: false, dataset: {}, value: '',
      get textContent() { return this.children.map(child => child.textContent).join(''); },
      set textContent(value) { this.children = [{ textContent: String(value) }]; },
      append(...children) { this.children.push(...children); },
      replaceChildren(...children) { this.children = children; },
      classList: { toggle(name, active) { if (active) classes.add(name); else classes.delete(name); }, contains: name => classes.has(name) },
      addEventListener(name, callback) { listeners.set(name, callback); },
      emit(name) { return listeners.get(name)?.({ preventDefault() {} }); },
      focus() {}
    };
  }
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const nodes = Object.fromEntries(ids.map(id => [`#${id}`, element()]));
  const clips = [];
  class TestAudio {
    constructor() { this.listeners = new Map(); this.currentTime = 0; this.playCount = 0; this.pauseCount = 0; clips.push(this); }
    addEventListener(name, callback) { this.listeners.set(name, callback); }
    emit(name) { this.listeners.get(name)?.(); }
    play() { this.playCount++; this.playedAt = this.currentTime; return this.pendingPlay || Promise.resolve(); }
    pause() { this.pauseCount++; }
    removeAttribute(name) { delete this[name]; }
    load() { this.error = null; }
  }
  const windowEvents = new Map();
  const replacements = {
    document: { querySelector: selector => nodes[selector], createElement: element },
    window: { addEventListener(name, callback) { windowEvents.set(name, callback); } },
    Audio: TestAudio
  };
  for (const [name, value] of Object.entries(replacements)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
    t.after(() => { if (previous) Object.defineProperty(globalThis, name, previous); else delete globalThis[name]; });
  }
  // Change one volume so this tests config application rather than Audio's default volume.
  const previousVolume = soundGame.sounds[0].volume;
  soundGame.sounds[0].volume = 0.42;
  const taggedData = await import('../sound-game/sound-data.js?v=sound-01');
  const previousTaggedVolume = taggedData.soundGame.sounds[0].volume;
  taggedData.soundGame.sounds[0].volume = 0.42;
  t.after(() => { soundGame.sounds[0].volume = previousVolume; taggedData.soundGame.sounds[0].volume = previousTaggedVolume; });
  await import('../sound-game/sound.js?test=page-flow');
  assert.equal(nodes['#start-button'].disabled, false);
  assert.equal(clips.length, 0);
  nodes['#start-button'].emit('click');
  assert.equal(clips[0].preload, 'none');
  assert.equal(clips[0].volume, 0.42);
  assert.equal(clips[0].playCount, 0);
  const form = nodes['#answer-form'];
  const input = nodes['#answer-input'];
  const next = nodes['#next-button'];
  const play = nodes['#play-button'];
  const status = nodes['#playback-status'];
  const originalId = form.dataset.soundId;
  form.emit('submit');
  assert.equal(form.dataset.soundId, originalId);
  await play.emit('click');
  clips[0].currentTime = 4;
  await play.emit('click');
  assert.equal(clips[0].playCount, 2);
  assert.equal(clips[0].playedAt, 0);
  assert.equal(clips[0].volume, 0.42);
  clips[0].emit('ended');
  assert.equal(nodes['#stop-button'].hidden, true);
  await play.emit('click');
  nodes['#stop-button'].emit('click');
  assert(status.textContent.includes('Stopped'));
  assert.equal(clips[0].currentTime, 0);

  for (let index = 0; index < 10; index++) {
    assert.equal(nodes['#results-screen'].hidden, true);
    assert.equal(nodes['#results-list'].children.length, 0);
    assert.equal(next.disabled, true);
    input.value = 'first guess';
    input.emit('input');
    assert.equal(next.disabled, false);
    input.value = '  ';
    input.emit('input');
    assert.equal(next.disabled, true);
    input.value = `answer ${index + 1}`;
    input.emit('input');
    if (index === 0) {
      // Advancing during a pending play must not let its late resolution alter the next round.
      let resolve;
      clips[0].pendingPlay = new Promise(done => { resolve = done; });
      const pending = play.emit('click');
      form.emit('submit');
      resolve();
      await pending;
      assert.equal(status.textContent, 'Ready to play.');
      clips[0].emit('error');
      assert.equal(status.textContent, 'Ready to play.');
    } else {
      if (index === 1) {
        clips[index].pendingPlay = Promise.reject(new Error('Audio failed'));
        await play.emit('click');
        assert(status.classList.contains('is-error'));
        clips[index].pendingPlay = null;
        clips[index].error = { code: 2 };
        await play.emit('click');
        assert(!status.classList.contains('is-error'));
        windowEvents.get('pagehide')();
        assert.equal(nodes['#stop-button'].hidden, true);
        await play.emit('click');
      }
      form.emit('submit');
    }
    assert(clips[index].pauseCount > 0);
    assert.equal(clips[index].src, undefined);
    if (index < 9) {
      assert.equal(input.value, '');
      assert.equal(clips[index + 1].volume, soundGame.sounds[index + 1].volume);
      assert.equal(clips[index + 1].playCount, 0);
    }
  }
  assert.equal(nodes['#sound-screen'].hidden, true);
  assert.equal(nodes['#results-screen'].hidden, false);
  const results = nodes['#results-list'].children;
  assert.equal(results.length, 10);
  for (let index = 0; index < 10; index++) {
    assert(results[index].textContent.includes(`answer ${index + 1}`));
    assert(results[index].textContent.includes(soundGame.sounds[index].answer));
  }
  nodes['#restart-button'].emit('click');
  assert.equal(nodes['#start-screen'].hidden, false);
  assert.equal(nodes['#results-list'].children.length, 0);
  nodes['#start-button'].emit('click');
  assert.equal(input.value, '');
  assert.equal(form.dataset.soundId, 'sound-1');
  assert.equal(next.disabled, true);
  assert.equal(clips.at(-1).volume, 0.42);
});
