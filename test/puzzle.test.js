import test from 'node:test';
import assert from 'node:assert/strict';
import { puzzle } from '../puzzle-config.js';
import { getOrderedKeys, getRecognizedAuthorities, isValidAttempt, validatePuzzle } from '../puzzle.js';

const ordered = getOrderedKeys(puzzle);
const correct = ordered.map(key => key.sequence);

test('the configured puzzle has five distinct keys and a five-digit lock code', () => {
  assert.doesNotThrow(() => validatePuzzle(puzzle));
  assert.equal(puzzle.lockCode, '48137');
  assert.deepEqual(ordered.map(key => key.name), ['Security', 'Engineering', 'Armory', 'Biolab', 'Command']);
});

test('only the exact ordered set is accepted, ignoring case and outer whitespace', () => {
  assert.equal(isValidAttempt(correct, ordered), true);
  assert.equal(isValidAttempt(correct.map(value => `  ${value.toLowerCase()}  `), ordered), true);
  assert.equal(isValidAttempt([...correct].reverse(), ordered), false);
  const swapped = [...correct];
  [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
  assert.equal(isValidAttempt(swapped, ordered), false);
});

test('missing, incorrect, duplicate, and extra credentials are rejected', () => {
  assert.equal(isValidAttempt(correct.slice(0, 4), ordered), false);
  assert.equal(isValidAttempt([...correct, correct[0]], ordered), false);
  assert.equal(isValidAttempt(Array(5), ordered), false);
  for (let index = 0; index < 5; index++) {
    const attempt = [...correct];
    attempt[index] = '';
    assert.equal(isValidAttempt(attempt, ordered), false);
    attempt[index] = 'INVALID';
    assert.equal(isValidAttempt(attempt, ordered), false);
  }
  assert.equal(isValidAttempt(Array(5).fill(correct[0]), ordered), false);
});

test('all 120 permutations recognize the same authorities but only one unlocks', () => {
  function permutations(values) {
    if (!values.length) return [[]];
    return values.flatMap((value, index) => permutations(values.filter((_, i) => i !== index)).map(rest => [value, ...rest]));
  }
  const attempts = permutations(correct);
  assert.equal(attempts.length, 120);
  assert.equal(attempts.filter(attempt => isValidAttempt(attempt, ordered)).length, 1);
  for (const attempt of attempts) {
    assert.deepEqual(getRecognizedAuthorities(attempt, puzzle.keys).map(key => key.id), puzzle.keys.map(key => key.id));
  }
});

test('recognition counts distinct authorities and ignores slot, case, and outer whitespace', () => {
  assert.equal(getRecognizedAuthorities(Array(5).fill(correct[0]), puzzle.keys).length, 1);
  assert.deepEqual(getRecognizedAuthorities(['', 'UNKNOWN', '', '', ''], puzzle.keys), []);
  assert.deepEqual(getRecognizedAuthorities(['', '', ` ${correct[0].toLowerCase()} `, '', ''], puzzle.keys).map(key => key.id), ['sec']);
  assert.equal(getRecognizedAuthorities(correct.map(value => value.replaceAll('-', '')), puzzle.keys).length, 0);
});

test('editing key display order does not change the required command order', () => {
  assert.deepEqual(getOrderedKeys({ ...puzzle, keys: [...puzzle.keys].reverse() }).map(key => key.sequence), correct);
});

test('malformed configuration fails before the terminal can unlock', () => {
  assert.throws(() => validatePuzzle({ ...puzzle, lockCode: '1234' }));
  assert.throws(() => validatePuzzle({ ...puzzle, keys: puzzle.keys.slice(1) }));
  assert.throws(() => validatePuzzle({ ...puzzle, keys: Array(5).fill(puzzle.keys[0]) }));
  assert.throws(() => validatePuzzle({ ...puzzle, order: ['sec', 'eng', 'arm', 'bio', 'bio'] }));
  assert.throws(() => validatePuzzle({ ...puzzle, order: ['sec', 'eng', 'arm', 'bio', 'unknown'] }));
  assert.throws(() => validatePuzzle({ ...puzzle, order: ['sec', 'eng', 'arm', 'bio'] }));
  assert.throws(() => validatePuzzle({ ...puzzle, lockCode: 48137 }));
  assert.doesNotThrow(() => validatePuzzle({ ...puzzle, lockCode: '01234' }));
});
