import { puzzle } from './puzzle-config.js';
import { isValidAttempt, normalizeSequence, validatePuzzle } from './puzzle.js';

const form = document.querySelector('#authorization-form');
const inputs = [...form.querySelectorAll('input')];
const status = document.querySelector('#attempt-status');
const success = document.querySelector('#success-panel');
const button = document.querySelector('#authorize-button');
const vaultState = document.querySelector('#vault-state');

try {
  validatePuzzle(puzzle);
  button.disabled = false;
} catch {
  status.textContent = 'Terminal configuration unavailable. Contact the game keeper.';
  status.classList.add('is-error');
}

form.addEventListener('submit', event => {
  event.preventDefault();
  if (button.disabled) return;
  const entries = inputs.map(input => normalizeSequence(input.value));
  inputs.forEach((input, index) => { input.value = entries[index]; });
  if (!isValidAttempt(entries, puzzle.keys)) {
    status.textContent = 'NOT VALID. The fragments or their order are incorrect.';
    status.classList.add('is-error');
    form.classList.remove('rejected');
    void form.offsetWidth;
    form.classList.add('rejected');
    const empty = inputs.find(input => !input.value);
    if (empty) empty.focus();
    return;
  }
  document.querySelector('#success-copy').textContent = puzzle.successText;
  const code = document.querySelector('#lock-code');
  code.replaceChildren(...[...puzzle.lockCode].map(digit => {
    const span = document.createElement('span');
    span.textContent = digit;
    span.setAttribute('aria-hidden', 'true');
    return span;
  }));
  code.setAttribute('aria-label', `Lock code: ${[...puzzle.lockCode].join(' ')}`);
  form.hidden = true;
  document.querySelector('#authorization-heading').hidden = true;
  success.hidden = false;
  vaultState.textContent = 'VAULT STATUS: AUTHORIZED';
  document.querySelector('.console').classList.add('is-unlocked');
  document.querySelector('#success-title').focus();
});

form.addEventListener('input', () => {
  status.textContent = 'Awaiting authorization fragments.';
  status.classList.remove('is-error');
});

form.addEventListener('reset', () => {
  status.textContent = 'Awaiting authorization fragments.';
  status.classList.remove('is-error');
  form.classList.remove('rejected');
});

document.querySelector('#restart-button').addEventListener('click', () => {
  form.reset();
  success.hidden = true;
  form.hidden = false;
  document.querySelector('#authorization-heading').hidden = false;
  document.querySelector('#lock-code').replaceChildren();
  document.querySelector('#lock-code').setAttribute('aria-label', 'Five-digit lock code');
  document.querySelector('.console').classList.remove('is-unlocked');
  vaultState.textContent = 'VAULT STATUS: SEALED';
  inputs[0].focus();
});
