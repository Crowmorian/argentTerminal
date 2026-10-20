import test from 'node:test';
import assert from 'node:assert/strict';
import { quiz } from '../quiz/quiz-data.js';
import { createQuizSession, validateQuiz } from '../quiz/quiz-session.js';

function completeQuiz(session, choose) {
  session.start();
  for (let index = 0; index < quiz.questions.length; index++) {
    const view = session.getView();
    assert(session.select(view.question.id, choose(index)));
    assert(session.submit(view.question.id));
  }
  return session.getView();
}

test('all fifteen supplied questions have four options and the supplied answer key', () => {
  assert.doesNotThrow(() => validateQuiz(quiz));
  assert.equal(quiz.questions.length, 15);
  assert.deepEqual(quiz.questions.map(question => question.correctIndex), [1, 0, 2, 1, 0, 2, 2, 3, 1, 2, 1, 1, 2, 1, 3]);
});

test('the quiz starts explicitly and cannot advance without one valid selection', () => {
  const session = createQuizSession(quiz);
  assert.equal(session.getView().screen, 'start');
  assert.equal(session.select('q1', 0), false);
  assert.equal(session.submit('q1'), false);
  assert.equal(session.start(), true);
  assert.equal(session.start(), false);
  assert.equal(session.submit('q1'), false);
  for (const invalid of [-1, 4, null, NaN, '1']) assert.equal(session.select('q1', invalid), false);
  assert.equal(session.getView().index, 0);
});

test('a selection can change before Next and is locked afterwards', () => {
  const session = createQuizSession(quiz);
  session.start();
  assert(session.select('q1', 0));
  assert(session.select('q1', 2));
  assert.equal(session.getView().selectedIndex, 2);
  assert(session.submit('q1'));
  assert.equal(session.select('q1', 1), false);
  assert.equal(session.submit('q1'), false);
  assert.equal(session.submit('q2'), false);
  assert.equal(session.getView().question.id, 'q2');
  assert.equal(session.getView().selectedIndex, null);
  for (const question of quiz.questions.slice(1)) {
    session.select(question.id, question.correctIndex);
    session.submit(question.id);
  }
  assert.equal(session.getView().results[0].selectedIndex, 2);
  assert.equal(session.getView().score, 14);
});

test('question views reveal no correctness information before completion', () => {
  const session = createQuizSession(quiz);
  session.start();
  for (const question of quiz.questions) {
    const view = session.getView();
    assert.equal(view.screen, 'question');
    for (const secret of ['results', 'score', 'answers', 'isCorrect', 'correctIndex']) assert.equal(secret in view, false);
    assert.equal('correctIndex' in view.question, false);
    session.select(question.id, question.correctIndex);
    assert.equal('score' in session.getView(), false);
    session.submit(question.id);
  }
  assert.equal(session.getView().screen, 'results');
});

test('all-correct, all-incorrect, and mixed runs score accurately', () => {
  const perfect = completeQuiz(createQuizSession(quiz), index => quiz.questions[index].correctIndex);
  assert.equal(perfect.score, 15);
  assert(perfect.results.every(result => result.isCorrect));
  const wrong = completeQuiz(createQuizSession(quiz), index => (quiz.questions[index].correctIndex + 1) % 4);
  assert.equal(wrong.score, 0);
  assert(wrong.results.every(result => !result.isCorrect));
  const mixed = completeQuiz(createQuizSession(quiz), index => (quiz.questions[index].correctIndex + index % 2) % 4);
  assert.equal(mixed.score, 8);
  assert.equal(mixed.total, 15);
});

test('completed results and committed answers cannot be changed', () => {
  const session = createQuizSession(quiz);
  const view = completeQuiz(session, index => quiz.questions[index].correctIndex);
  assert.equal(session.select('q15', 0), false);
  assert.equal(session.submit('q15'), false);
  view.results[0].selectedIndex = 0;
  view.results[0].options[0] = 'Changed';
  assert.equal(session.getView().score, 15);
  assert.equal(session.getView().results[0].selectedIndex, 1);
  assert.equal(session.getView().results[0].options[0], 'Darkness');
});

test('restart clears the previous run and returns to the start screen', () => {
  const session = createQuizSession(quiz);
  completeQuiz(session, () => 0);
  session.reset();
  assert.equal(session.getView().screen, 'start');
  assert.equal('results' in session.getView(), false);
  session.start();
  assert.equal(session.getView().index, 0);
  assert.equal(session.getView().selectedIndex, null);
  assert.equal(session.submit('q1'), false);
});

test('invalid question data fails before the quiz starts', () => {
  assert.throws(() => createQuizSession({ ...quiz, questions: [] }));
  assert.throws(() => createQuizSession({ ...quiz, questions: [quiz.questions[0], quiz.questions[0]] }));
  for (const question of [
    { ...quiz.questions[0], options: ['A', 'B', 'C'] },
    { ...quiz.questions[0], options: ['A', 'A', 'C', 'D'] },
    { ...quiz.questions[0], options: ['A', '', 'C', 'D'] },
    { ...quiz.questions[0], correctIndex: 4 }
  ]) assert.throws(() => createQuizSession({ ...quiz, questions: [question] }));
});
