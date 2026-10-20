import test from 'node:test';
import assert from 'node:assert/strict';
import { createImageGameSession, validateImageGame } from '../image-game/game-session.js';
import { imageGame } from '../image-game/game-data.js';
import { access } from 'node:fs/promises';

const config = {
  title: 'Image Memory', viewSeconds: 30,
  rounds: Array.from({ length: 3 }, (_, index) => ({
    id: `image-${index + 1}`, title: `Image ${index + 1}`, src: `./images/image${index + 1}.jpg`,
    questions: Array.from({ length: 5 }, (_, question) => ({ question: `Question ${question + 1}?`, answer: `Answer ${question + 1}` }))
  }))
};

test('the published game has three existing images and five complete questions per round', async () => {
  validateImageGame(imageGame);
  assert.equal(imageGame.viewSeconds, 30);
  for (const round of imageGame.rounds) await access(new URL(`../image-game/${round.src}`, import.meta.url));
});

function setup() {
  let time = 0;
  const session = createImageGameSession(config, () => time);
  return { session, setTime(value) { time = value; } };
}

test('the hub offers three neutral image choices without revealing pictures or questions', () => {
  const { session } = setup();
  const view = session.getView();
  assert.equal(view.phase, 'hub');
  assert.equal(view.rounds.length, 3);
  assert(view.rounds.every(round => !('src' in round) && !('questions' in round)));
  assert.equal(session.chooseRound('unknown'), false);
});

test('the full 30 seconds start only after image loading completes', () => {
  const { session, setTime } = setup();
  assert(session.chooseRound('image-1'));
  setTime(120000);
  assert.equal(session.getView().phase, 'loading');
  assert.equal(session.revealAnswers(), false);
  assert(session.imageLoaded('image-1'));
  assert.equal(session.getView().remainingMs, 30000);
  setTime(149999);
  assert.equal(session.getView().phase, 'viewing');
  assert.equal(session.getView().remainingMs, 1);
  setTime(150000);
  const view = session.getView();
  assert.equal(view.phase, 'questions');
  assert.equal(view.questions.length, 5);
  assert.equal('src' in view, false);
  assert(view.questions.every(item => !('answer' in item)));
});

test('a delayed timer callback or background tab cannot extend the viewing deadline', () => {
  const { session, setTime } = setup();
  session.chooseRound('image-2');
  session.imageLoaded('image-2');
  setTime(90000);
  assert.equal(session.getView().phase, 'questions');
});

test('questions remain untimed and answers appear only after the reveal action', () => {
  const { session, setTime } = setup();
  session.chooseRound('image-3');
  session.imageLoaded('image-3');
  assert.equal(session.revealAnswers(), false);
  setTime(30000);
  assert.equal(session.getView().phase, 'questions');
  setTime(3600000);
  assert.equal(session.getView().phase, 'questions');
  assert.equal(session.backToHub(), false);
  assert(session.revealAnswers());
  assert.equal(session.getView().phase, 'answers');
  assert.equal(session.getView().questions[0].answer, 'Answer 1');
  assert.equal('src' in session.getView(), false);
});

test('returning to the hub records completion and another round gets a fresh countdown', () => {
  const { session, setTime } = setup();
  session.chooseRound('image-1');
  session.imageLoaded('image-1');
  setTime(30000);
  session.revealAnswers();
  assert(session.backToHub());
  assert.equal(session.getView().rounds[0].completed, true);
  assert.equal(session.getView().rounds[1].completed, false);
  session.chooseRound('image-2');
  setTime(100000);
  session.imageLoaded('image-2');
  assert.equal(session.getView().remainingMs, 30000);
});

test('failed loads can be retried without consuming viewing time', () => {
  const { session, setTime } = setup();
  session.chooseRound('image-1');
  assert.equal(session.imageLoaded('image-2'), false);
  assert(session.imageFailed('image-1'));
  assert.equal(session.getView().phase, 'error');
  setTime(500000);
  assert(session.retry());
  assert.equal(session.getView().phase, 'loading');
  assert(session.imageLoaded('image-1'));
  assert.equal(session.getView().remainingMs, 30000);
});

test('cancelled loads cannot start a timer or replace another round', () => {
  const { session } = setup();
  session.chooseRound('image-1');
  assert(session.backToHub());
  assert.equal(session.imageLoaded('image-1'), false);
  session.chooseRound('image-2');
  assert.equal(session.imageLoaded('image-1'), false);
  assert.equal(session.imageFailed('image-1'), false);
  assert.equal(session.getView().id, 'image-2');
  assert.equal(session.getView().phase, 'loading');
});

test('every round requires five complete question-and-answer pairs', () => {
  assert.doesNotThrow(() => validateImageGame(config));
  assert.throws(() => validateImageGame({ ...config, viewSeconds: 0 }));
  assert.throws(() => validateImageGame({ ...config, rounds: config.rounds.slice(1) }));
  assert.throws(() => validateImageGame({ ...config, rounds: [config.rounds[0], config.rounds[0], config.rounds[2]] }));
  assert.throws(() => validateImageGame({ ...config, rounds: [{ ...config.rounds[0], questions: [] }, ...config.rounds.slice(1)] }));
});
