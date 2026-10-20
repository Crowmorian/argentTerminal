import { imageGame } from './game-data.js?v=images-02';
import { createImageGameSession } from './game-session.js?v=images-02';

const screens = {
  hub: document.querySelector('#hub-screen'), loading: document.querySelector('#loading-screen'),
  viewing: document.querySelector('#image-screen'), questions: document.querySelector('#questions-screen'),
  answers: document.querySelector('#answers-screen')
};
const image = document.querySelector('#round-image');
const answerImage = document.querySelector('#answer-image');
const countdown = document.querySelector('#countdown');
let session;
let timer = null;
let loadToken = 0;

function clearTimer() {
  clearTimeout(timer);
  timer = null;
}

function makeText(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function updateCountdown(view) {
  const seconds = Math.ceil(view.remainingMs / 1000);
  countdown.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  countdown.setAttribute('aria-label', `${seconds} seconds remaining`);
  countdown.classList.toggle('is-low', seconds <= 5);
}

function tick() {
  clearTimer();
  const view = session.getView();
  if (view.phase !== 'viewing') {
    render();
    return;
  }
  updateCountdown(view);
  timer = setTimeout(tick, Math.min(200, view.remainingMs));
}

function render(focus = true) {
  clearTimer();
  const view = session.getView();
  const active = view.phase === 'error' ? 'loading' : view.phase;
  for (const [name, screen] of Object.entries(screens)) screen.hidden = name !== active;
  document.body.classList.toggle('is-viewing-image', active === 'viewing');
  if (active !== 'viewing') {
    image.removeAttribute('src');
    image.alt = '';
  }
  if (active !== 'answers') {
    answerImage.removeAttribute('src');
    answerImage.alt = '';
  }
  if (active === 'hub') {
    document.querySelector('#round-buttons').replaceChildren(...view.rounds.map(round => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'memory-round';
      button.append(makeText('span', 'round-label', round.title), makeText('span', 'round-state', round.completed ? 'ANSWERS VIEWED' : 'START'));
      button.addEventListener('click', () => {
        if (session.chooseRound(round.id)) loadImage();
      });
      return button;
    }));
    if (focus) document.querySelector('#hub-title').focus();
  } else if (active === 'loading') {
    const failed = view.phase === 'error';
    document.querySelector('#loading-round').textContent = view.title;
    document.querySelector('#loading-title').textContent = failed ? 'Image could not load' : 'Loading image…';
    document.querySelector('#loading-status').textContent = failed ? 'Try loading this image again.' : 'The countdown starts when the image is ready.';
    document.querySelector('#loading-error-actions').hidden = !failed;
    if (focus) document.querySelector('#loading-title').focus();
  } else if (active === 'viewing') {
    document.querySelector('#image-title').textContent = view.title;
    image.src = view.src;
    image.alt = view.alt;
    tick();
  } else if (active === 'questions') {
    document.querySelector('#questions-round').textContent = view.title;
    document.querySelector('#question-list').replaceChildren(...view.questions.map(item => makeText('li', '', item.question)));
    if (focus) document.querySelector('#questions-title').focus();
  } else if (active === 'answers') {
    document.querySelector('#answers-round').textContent = view.title;
    answerImage.src = view.src;
    answerImage.alt = view.alt;
    document.querySelector('#answer-list').replaceChildren(...view.questions.map(item => {
      const card = document.createElement('li');
      card.append(makeText('h3', '', item.question), makeText('p', '', item.answer));
      return card;
    }));
    if (focus) document.querySelector('#answers-title').focus();
  }
}

async function loadImage() {
  const view = session.getView();
  if (view.phase !== 'loading') return;
  const token = ++loadToken;
  render();
  try {
    const preload = new Image();
    preload.decoding = 'async';
    await new Promise((resolve, reject) => {
      preload.onload = resolve;
      preload.onerror = reject;
      preload.src = view.src;
    });
    if (typeof preload.decode === 'function') await preload.decode();
    if (token !== loadToken) return;
    if (session.imageLoaded(view.id)) render();
  } catch {
    if (token !== loadToken) return;
    if (session.imageFailed(view.id)) render();
  }
}

try {
  session = createImageGameSession(imageGame);
  document.title = imageGame.title;
  document.querySelector('#hub-title').textContent = imageGame.title;
  render(false);
} catch {
  document.querySelector('#game-error').hidden = false;
}

document.querySelector('#answers-button').addEventListener('click', () => {
  if (session?.revealAnswers()) render();
});
document.querySelector('#hub-button').addEventListener('click', () => {
  if (session?.backToHub()) { loadToken++; render(); }
});
document.querySelector('#cancel-button').addEventListener('click', () => {
  if (session?.backToHub()) { loadToken++; render(); }
});
document.querySelector('#retry-button').addEventListener('click', () => {
  if (session?.retry()) loadImage();
});
document.addEventListener('visibilitychange', () => {
  if (session && !document.hidden && session.getView().phase !== 'hub') tick();
});
window.addEventListener('pageshow', () => {
  if (session && session.getView().phase !== 'hub') tick();
});
