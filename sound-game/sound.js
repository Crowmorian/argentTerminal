import { soundGame } from './sound-data.js?v=sound-01';
import { createSoundSession } from './sound-session.js?v=sound-01';

const startScreen = document.querySelector('#start-screen');
const soundScreen = document.querySelector('#sound-screen');
const resultsScreen = document.querySelector('#results-screen');
const form = document.querySelector('#answer-form');
const input = document.querySelector('#answer-input');
const nextButton = document.querySelector('#next-button');
const playButton = document.querySelector('#play-button');
const stopButton = document.querySelector('#stop-button');
const playbackStatus = document.querySelector('#playback-status');
let session;
let currentAudio = null;
let playbackAttempt = 0;
let hasPlayed = false;

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function setPlaybackStatus(text, error = false) {
  playbackStatus.textContent = text;
  playbackStatus.classList.toggle('is-error', error);
}

function releaseAudio() {
  playbackAttempt++;
  const previous = currentAudio;
  currentAudio = null;
  if (previous) {
    previous.pause();
    previous.removeAttribute('src');
    previous.load();
  }
}

function prepareAudio(sound) {
  const audio = new Audio();
  audio.preload = 'none';
  audio.src = sound.src;
  audio.volume = sound.volume;
  currentAudio = audio;
  hasPlayed = false;
  playButton.textContent = 'PLAY SOUND';
  stopButton.hidden = true;
  setPlaybackStatus('Ready to play.');
  audio.addEventListener('ended', () => {
    if (currentAudio !== audio) return;
    stopButton.hidden = true;
    setPlaybackStatus('Finished. You can play it again.');
  });
  audio.addEventListener('error', () => {
    if (currentAudio !== audio) return;
    stopButton.hidden = true;
    setPlaybackStatus('Could not play this sound. Press Play to try again.', true);
  });
}

async function playSound() {
  const audio = currentAudio;
  if (!audio) return;
  const attempt = ++playbackAttempt;
  audio.pause();
  setPlaybackStatus('Loading sound…');
  stopButton.hidden = false;
  try {
    // A failed resource needs a fresh load before a retry. Every play starts at the beginning.
    if (audio.error) audio.load();
    audio.currentTime = 0;
    await audio.play();
    if (currentAudio !== audio || attempt !== playbackAttempt) return;
    hasPlayed = true;
    playButton.textContent = 'REPLAY SOUND';
    setPlaybackStatus('Playing…');
  } catch {
    if (currentAudio !== audio || attempt !== playbackAttempt) return;
    stopButton.hidden = true;
    setPlaybackStatus('Could not play this sound. Press Play to try again.', true);
  }
}

function render(focus = true) {
  releaseAudio();
  const view = session.getView();
  startScreen.hidden = view.screen !== 'start';
  soundScreen.hidden = view.screen !== 'sound';
  resultsScreen.hidden = view.screen !== 'results';
  document.title = view.title;
  document.querySelector('#start-title').textContent = view.title;
  const status = document.querySelector('#round-status');
  if (view.screen === 'sound') {
    status.textContent = `SOUND ${view.index + 1} OF ${view.total}`;
    document.querySelector('#sound-count').textContent = `Sound ${view.index + 1} of ${view.total}`;
    const progress = document.querySelector('#sound-progress');
    progress.max = view.total;
    progress.value = view.index;
    form.dataset.soundId = view.sound.id;
    input.value = view.draft;
    nextButton.disabled = !view.draft.trim();
    nextButton.textContent = view.index === view.total - 1 ? 'SHOW ANSWERS →' : 'NEXT →';
    prepareAudio(view.sound);
    if (focus) document.querySelector('#sound-title').focus();
  } else if (view.screen === 'results') {
    status.textContent = 'RESULTS';
    input.value = '';
    document.querySelector('#results-list').replaceChildren(...view.results.map((result, index) => {
      const card = document.createElement('li');
      card.className = 'sound-result';
      const comparison = document.createElement('dl');
      for (const [label, answer, className] of [
        ['Your answer', result.selectedAnswer, ''], ['Correct answer', result.answer, 'expected-answer']
      ]) {
        const row = document.createElement('div');
        row.append(textElement('dt', '', label), textElement('dd', className, answer));
        comparison.append(row);
      }
      card.append(textElement('h3', '', `Sound ${index + 1}`), comparison);
      return card;
    }));
    if (focus) document.querySelector('#results-title').focus();
  } else {
    status.textContent = 'READY TO START';
    input.value = '';
    document.querySelector('#results-list').replaceChildren();
    if (focus) document.querySelector('#start-title').focus();
  }
}

try {
  session = createSoundSession(soundGame);
  render(false);
  document.querySelector('#start-button').disabled = false;
} catch {
  document.querySelector('#game-error').hidden = false;
}

document.querySelector('#start-button').addEventListener('click', () => {
  if (session?.start()) render();
});
playButton.addEventListener('click', playSound);
stopButton.addEventListener('click', () => {
  if (!currentAudio) return;
  playbackAttempt++;
  currentAudio.pause();
  currentAudio.currentTime = 0;
  stopButton.hidden = true;
  playButton.textContent = hasPlayed ? 'REPLAY SOUND' : 'PLAY SOUND';
  setPlaybackStatus('Stopped. You can play it again.');
});
input.addEventListener('input', () => {
  if (session?.edit(form.dataset.soundId, input.value)) nextButton.disabled = !input.value.trim();
});
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!session?.edit(form.dataset.soundId, input.value)) return;
  if (session.submit(form.dataset.soundId)) render();
});
document.querySelector('#restart-button').addEventListener('click', () => {
  if (!session) return;
  session.reset();
  render();
});
window.addEventListener('pagehide', () => {
  playbackAttempt++;
  currentAudio?.pause();
  stopButton.hidden = true;
  setPlaybackStatus('Stopped. Press Play to listen again.');
});
