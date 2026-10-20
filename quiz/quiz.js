import { quiz } from './quiz-data.js?v=quiz-02';
import { createQuizSession } from './quiz-session.js?v=quiz-02';

const startScreen = document.querySelector('#start-screen');
const questionScreen = document.querySelector('#question-screen');
const resultsScreen = document.querySelector('#results-screen');
const startButton = document.querySelector('#start-button');
const nextButton = document.querySelector('#next-button');
const form = document.querySelector('#question-form');
const options = document.querySelector('#answer-options');
const letters = ['A', 'B', 'C', 'D'];
let session;

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function renderResults(view) {
  const cards = view.results.map((result, index) => {
    const card = document.createElement('li');
    card.className = `result-card ${result.isCorrect ? 'is-correct' : 'is-incorrect'}`;
    const caption = document.createElement('div');
    caption.className = 'result-caption';
    caption.append(textElement('span', 'result-number', `QUESTION ${String(index + 1).padStart(2, '0')}`));
    const verdict = document.createElement('span');
    verdict.className = 'result-verdict';
    const mark = textElement('span', 'result-mark', result.isCorrect ? '✓' : '×');
    mark.setAttribute('aria-hidden', 'true');
    verdict.append(mark, document.createTextNode(result.isCorrect ? 'Correct' : 'Incorrect'));
    caption.append(verdict);
    card.append(caption, textElement('h3', 'result-question', result.text));
    const selected = document.createElement('div');
    selected.className = `review-answer ${result.isCorrect ? 'answer-correct' : 'answer-incorrect'}`;
    selected.append(textElement('span', 'review-label', 'Your answer'), textElement('p', '', `${letters[result.selectedIndex]}. ${result.options[result.selectedIndex]}`));
    card.append(selected);
    if (!result.isCorrect) {
      const correct = document.createElement('div');
      correct.className = 'review-answer answer-correct';
      correct.append(textElement('span', 'review-label', 'Correct answer'), textElement('p', '', `${letters[result.correctIndex]}. ${result.options[result.correctIndex]}`));
      card.append(correct);
    }
    return card;
  });
  document.querySelector('#results-list').replaceChildren(...cards);
  const score = document.querySelector('#final-score');
  score.replaceChildren(textElement('strong', '', String(view.score)), document.createTextNode(` out of ${view.total}`));
}

function render(focus = true) {
  const view = session.getView();
  startScreen.hidden = view.screen !== 'start';
  questionScreen.hidden = view.screen !== 'question';
  resultsScreen.hidden = view.screen !== 'results';
  document.title = view.title;
  document.querySelector('#quiz-brand').textContent = view.title;
  document.querySelector('#start-title').textContent = view.title;
  document.querySelector('#quiz-meta').textContent = `${view.total} QUESTIONS`;
  document.querySelector('#quiz-meta').hidden = view.screen === 'start';
  document.querySelector('#quiz-footer').textContent = view.screen === 'start' ? 'READY TO START' : view.screen === 'results' ? 'QUIZ COMPLETE' : 'ANSWERS REVEALED AT THE END';
  const roundStatus = document.querySelector('#round-status');

  if (view.screen === 'question') {
    roundStatus.textContent = `QUESTION ${view.index + 1} OF ${view.total}`;
    document.querySelector('#question-count').textContent = `Question ${view.index + 1} of ${view.total}`;
    document.querySelector('#answer-count').textContent = `${view.index} answered`;
    const progress = document.querySelector('#quiz-progress');
    progress.max = view.total;
    progress.value = view.index;
    const heading = document.querySelector('#question-title');
    heading.textContent = view.question.text;
    form.dataset.questionId = view.question.id;
    const choices = view.question.options.map((answer, index) => {
      const label = document.createElement('label');
      label.className = 'quiz-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'quiz-answer';
      input.value = String(index);
      input.required = true;
      input.checked = index === view.selectedIndex;
      input.dataset.questionId = view.question.id;
      label.classList.toggle('is-selected', input.checked);
      const letter = textElement('span', 'option-letter', letters[index]);
      letter.setAttribute('aria-hidden', 'true');
      label.append(input, letter, textElement('span', 'option-text', answer));
      return label;
    });
    options.replaceChildren(...choices);
    nextButton.disabled = view.selectedIndex === null;
    nextButton.replaceChildren(document.createTextNode(view.index === view.total - 1 ? 'FINISH QUIZ ' : 'NEXT '), textElement('span', 'quiz-arrow', '→'));
    nextButton.querySelector('span').setAttribute('aria-hidden', 'true');
    document.querySelector('#selection-help').textContent = 'Choose one answer to continue.';
    if (focus) heading.focus();
  } else if (view.screen === 'results') {
    roundStatus.textContent = 'RESULTS';
    options.replaceChildren();
    renderResults(view);
    if (focus) document.querySelector('#results-title').focus();
  } else {
    roundStatus.textContent = 'READY TO START';
    options.replaceChildren();
    document.querySelector('#results-list').replaceChildren();
    document.querySelector('#final-score').replaceChildren();
    if (focus) document.querySelector('#start-title').focus();
  }
}

try {
  session = createQuizSession(quiz);
  render(false);
  startButton.disabled = false;
} catch {
  document.querySelector('#quiz-error').hidden = false;
}

startButton.addEventListener('click', () => {
  if (session?.start()) render();
});

form.addEventListener('change', event => {
  const input = event.target;
  if (input.name !== 'quiz-answer' || !session?.select(input.dataset.questionId, Number(input.value))) return;
  for (const choice of options.children) choice.classList.toggle('is-selected', choice.querySelector('input').checked);
  nextButton.disabled = false;
  document.querySelector('#selection-help').textContent = 'Your choice will be locked when you continue.';
});

form.addEventListener('submit', event => {
  event.preventDefault();
  if (session?.submit(form.dataset.questionId)) render();
});

document.querySelector('#restart-button').addEventListener('click', () => {
  if (!session) return;
  session.reset();
  render();
});
