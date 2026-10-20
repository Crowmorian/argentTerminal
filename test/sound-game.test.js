import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { soundGame } from '../sound-game/sound-data.js';
import { createSoundSession, validateSoundGame } from '../sound-game/sound-session.js';

test('ten configured clips exist with valid volume settings and the confirmed answer', async () => {
  validateSoundGame(soundGame);
  for (const sound of soundGame.sounds) await access(new URL(`../sound-game/${sound.src}`, import.meta.url));
  assert.equal(soundGame.sounds[4].answer, 'Ghostbusters – Proton Pack');
});

test('answers are editable until committed and only current sound IDs can change them', () => {
  const session = createSoundSession(soundGame);
  assert.equal(session.getView().screen, 'start');
  assert.equal(session.edit('sound-1', 'before start'), false);
  assert.equal(session.submit('sound-1'), false);
  assert(session.start());
  assert.equal(session.start(), false);
  assert.equal(session.getView().sound.id, 'sound-1');
  assert.equal('answer' in session.getView().sound, false);
  assert.equal('results' in session.getView(), false);
  assert.equal(session.submit('sound-1'), false);
  assert(session.edit('sound-1', 'first guess'));
  assert.equal(session.getView().draft, 'first guess');
  assert(session.edit('sound-1', '   '));
  assert.equal(session.submit('sound-1'), false);
  assert(session.edit('sound-1', '  final guess  '));
  assert(session.submit('sound-1'));
  assert.equal(session.getView().draft, '');
  assert.equal(session.edit('sound-1', 'tamper with a locked answer'), false);
  assert.equal(session.submit('sound-1'), false);
  assert.equal(session.getView().sound.id, 'sound-2');
});

test('all ten free-text answers are compared only at the end and reset clears the run', () => {
  const session = createSoundSession(soundGame);
  session.start();
  for (let index = 0; index < 10; index++) {
    const view = session.getView();
    assert.equal(view.index, index);
    assert.equal('results' in view, false);
    assert.equal('answer' in view.sound, false);
    session.edit(view.sound.id, `  answer ${index + 1}  `);
    assert(session.submit(view.sound.id));
  }
  const view = session.getView();
  assert.equal(view.screen, 'results');
  assert.equal(view.results.length, 10);
  assert.deepEqual(view.results.map(result => result.selectedAnswer), Array.from({ length: 10 }, (_, index) => `answer ${index + 1}`));
  assert.deepEqual(view.results.map(result => result.answer), soundGame.sounds.map(sound => sound.answer));
  assert.equal('score' in view, false);
  assert.equal(session.edit('sound-10', 'too late'), false);
  assert.equal(session.submit('sound-10'), false);
  // Returned results cannot rewrite the committed answers.
  view.results[0].selectedAnswer = 'tampered';
  assert.equal(session.getView().results[0].selectedAnswer, 'answer 1');
  session.reset();
  assert.equal(session.getView().screen, 'start');
  session.start();
  assert.equal(session.getView().index, 0);
  assert.equal(session.getView().draft, '');
  assert.equal(session.submit('sound-1'), false);
});

test('volume settings are independently configurable and reject out-of-range values', () => {
  const config = structuredClone(soundGame);
  config.sounds[0].volume = 0.35;
  config.sounds[1].volume = 0;
  const session = createSoundSession(config);
  session.start();
  assert.equal(session.getView().sound.volume, 0.35);
  session.edit('sound-1', 'guess');
  session.submit('sound-1');
  assert.equal(session.getView().sound.volume, 0);
  for (const volume of [-0.1, 1.1, NaN, Infinity, '0.5', undefined]) {
    const invalid = structuredClone(soundGame);
    invalid.sounds[0].volume = volume;
    assert.throws(() => validateSoundGame(invalid), /volume/);
  }
  assert.throws(() => validateSoundGame({ ...soundGame, sounds: soundGame.sounds.slice(1) }), /ten/);
});
