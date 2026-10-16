import { puzzle } from './puzzle-config.js?v=sentinel-05';
import { getOrderedKeys, getRecognizedAuthorities, isValidAttempt, normalizeSequence, validatePuzzle } from './puzzle.js?v=sentinel-05';

const form = document.querySelector('#authorization-form');
const inputs = [...form.querySelectorAll('input')];
const rows = inputs.map(input => input.closest('.sequence-row'));
const status = document.querySelector('#attempt-status');
const success = document.querySelector('#success-panel');
const button = document.querySelector('#authorize-button');
const consolePanel = document.querySelector('.console');
const indicators = document.querySelector('#authority-indicators');
let orderedKeys = [];
let previousCount = 0;
let rejectionTimer = null;
const REJECTION_RESET_MS = 5000;

function cancelRejectionReset() {
  clearTimeout(rejectionTimer);
  rejectionTimer = null;
}

function setStatus(heading, detail, isError = false) {
  cancelRejectionReset();
  document.querySelector('#status-heading').textContent = heading;
  document.querySelector('#status-detail').textContent = detail;
  status.classList.toggle('is-error', isError);
  consolePanel.classList.toggle('is-denied', isError);
}

function updateRecognition(announce = true) {
  const entries = inputs.map(input => normalizeSequence(input.value));
  const recognized = getRecognizedAuthorities(entries, puzzle.keys);
  const knownSequences = new Set(puzzle.keys.map(key => normalizeSequence(key.sequence)));
  rows.forEach((row, index) => {
    const known = knownSequences.has(entries[index]);
    row.classList.toggle('is-recognized', known);
    row.querySelector('.credential-state').textContent = known ? 'CREDENTIAL RECOGNIZED' : 'AWAITING CREDENTIAL';
  });
  const recognizedIds = new Set(recognized.map(key => key.id));
  for (const indicator of indicators.children) {
    const known = recognizedIds.has(indicator.dataset.authority);
    indicator.classList.toggle('is-recognized', known);
    indicator.setAttribute('aria-label', `${indicator.textContent}: ${known ? 'recognized' : 'awaiting credential'}`);
  }
  document.querySelector('#recognized-count').textContent = `${String(recognized.length).padStart(2, '0')} / 05`;
  document.body.classList.toggle('has-credentials', recognized.length > 0);
  document.body.classList.toggle('all-recognized', recognized.length === 5);
  if (announce) {
    if (recognized.length === 5) {
      setStatus('FIVE AUTHORITIES RECOGNIZED', 'COMMAND ORDER REQUIRED');
    } else if (recognized.length > 0) {
      setStatus('SENTINEL AUTHORITY VERIFIED', `${recognized.length} OF FIVE AUTHORITIES RECOGNIZED. COMMAND ORDER UNRESOLVED.`);
    } else {
      setStatus('AWAITING SENTINEL CREDENTIALS', 'COMMAND HIERARCHY UNRESOLVED');
    }
  }
  previousCount = recognized.length;
}

try {
  validatePuzzle(puzzle);
  orderedKeys = getOrderedKeys(puzzle);
  // Alphabetical display never exposes the required command order.
  for (const key of [...puzzle.keys].sort((a, b) => a.name.localeCompare(b.name))) {
    const indicator = document.createElement('li');
    indicator.dataset.authority = key.id;
    indicator.textContent = key.name;
    indicators.append(indicator);
  }
  button.disabled = false;
  updateRecognition(false);
} catch {
  button.disabled = true;
  setStatus('SENTINEL COMMAND UNAVAILABLE', 'RELIQUARY REMAINS SEALED. SEEK SANCTIONED AUTHORITY.', true);
}

form.addEventListener('input', () => {
  if (button.disabled) return;
  // Only announce a changed authority count, or clear the previous denial.
  const count = getRecognizedAuthorities(inputs.map(input => input.value), puzzle.keys).length;
  updateRecognition(count !== previousCount || status.classList.contains('is-error'));
});

form.addEventListener('submit', event => {
  event.preventDefault();
  if (button.disabled) return;
  cancelRejectionReset();
  const entries = inputs.map(input => normalizeSequence(input.value));
  inputs.forEach((input, index) => { input.value = entries[index]; });
  updateRecognition(false);
  if (!isValidAttempt(entries, orderedKeys)) {
    setStatus('AUTHORIZATION DENIED', 'THE PRESENTED ORDER VIOLATES SENTINEL COMMAND LAW. RELIQUARY REMAINS SEALED.', true);
    rejectionTimer = setTimeout(() => {
      rejectionTimer = null;
      updateRecognition();
    }, REJECTION_RESET_MS);
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
  code.setAttribute('aria-label', `Mechanical access code: ${[...puzzle.lockCode].join(' ')}`);
  form.hidden = true;
  document.querySelector('#authorization-heading').hidden = true;
  success.hidden = false;
  consolePanel.setAttribute('aria-labelledby', 'success-title');
  consolePanel.classList.add('is-unlocked');
  consolePanel.classList.remove('is-denied');
  document.body.classList.add('is-authorized');
  document.querySelector('#vault-state').textContent = 'RELIQUARY SEAL RELEASED';
  document.querySelector('#reliquary-state').textContent = 'RELIQUARY SEAL RELEASED';
  document.querySelector('#hierarchy-state').textContent = 'COMMAND HIERARCHY ACCEPTED';
  document.querySelector('#success-title').focus();
});

form.addEventListener('reset', () => {
  // Reset recognition immediately; native reset clears values after this event.
  inputs.forEach(input => { input.value = ''; });
  if (!button.disabled) updateRecognition();
});

document.querySelector('#restart-button').addEventListener('click', () => {
  form.reset();
  success.hidden = true;
  form.hidden = false;
  document.querySelector('#authorization-heading').hidden = false;
  const code = document.querySelector('#lock-code');
  code.replaceChildren();
  code.setAttribute('aria-label', 'Five-digit mechanical access code');
  document.querySelector('#success-copy').textContent = '';
  consolePanel.classList.remove('is-unlocked');
  consolePanel.setAttribute('aria-labelledby', 'console-title');
  document.body.classList.remove('is-authorized');
  document.querySelector('#vault-state').textContent = 'RELIQUARY SEALED';
  document.querySelector('#reliquary-state').textContent = 'RELIQUARY SEALED';
  document.querySelector('#hierarchy-state').textContent = 'COMMAND HIERARCHY UNRESOLVED';
  inputs[0].focus();
});
