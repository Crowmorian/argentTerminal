import test from 'node:test';
import assert from 'node:assert/strict';
import { puzzle } from '../puzzle-config.js';
import { isValidAttempt, validatePuzzle } from '../puzzle.js';

const correct = puzzle.keys.map(key => key.sequence);

test('the configured puzzle has five distinct keys and a five-digit lock code', () => {
  assert.doesNotThrow(() => validatePuzzle(puzzle));
  assert.equal(puzzle.lockCode, '48137');
});

test('only the exact ordered set is accepted, ignoring case and outer whitespace', () => {
  assert.equal(isValidAttempt(correct, puzzle.keys), true);
  assert.equal(isValidAttempt(correct.map(value => `  ${value.toLowerCase()}  `), puzzle.keys), true);
  assert.equal(isValidAttempt([...correct].reverse(), puzzle.keys), false);
  const swapped = [...correct];
  [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
  assert.equal(isValidAttempt(swapped, puzzle.keys), false);
});

test('missing, incorrect, duplicate, and extra fragments are rejected', () => {
  assert.equal(isValidAttempt(correct.slice(0, 4), puzzle.keys), false);
  assert.equal(isValidAttempt([...correct, correct[0]], puzzle.keys), false);
  for (let index = 0; index < 5; index++) {
    const attempt = [...correct];
    attempt[index] = '';
    assert.equal(isValidAttempt(attempt, puzzle.keys), false);
    attempt[index] = 'INVALID';
    assert.equal(isValidAttempt(attempt, puzzle.keys), false);
  }
  assert.equal(isValidAttempt(Array(5).fill(correct[0]), puzzle.keys), false);
});

test('malformed configuration fails before the terminal can unlock', () => {
  assert.throws(() => validatePuzzle({ ...puzzle, lockCode: '1234' }));
  assert.throws(() => validatePuzzle({ ...puzzle, keys: puzzle.keys.slice(1) }));
  assert.throws(() => validatePuzzle({ ...puzzle, keys: Array(5).fill(puzzle.keys[0]) }));
});
