import { puzzle } from './puzzle-config.js?v=sentinel-08';

// Dedicated routes bind their authority; the original NFC query URLs still work.
const id = document.body.dataset.key || new URLSearchParams(location.search).get('key');
const key = puzzle.keys.find(item => item.id === id);
if (!key) {
  document.querySelector('#key-title').textContent = 'Authority unrecognized';
  document.querySelector('#key-error').hidden = false;
  document.querySelector('#key-activation').textContent = 'AUTHORITY NOT RECOGNIZED';
} else {
  document.title = `${key.name} | Sentinel Authority Record`;
  document.querySelector('#key-title').textContent = key.name;
  document.querySelector('#key-sequence').textContent = key.sequence;
  document.querySelector('#key-protocol').textContent = key.protocol;
  document.querySelector('#key-status').replaceChildren(...key.status.map(text => {
    const line = document.createElement('li');
    line.textContent = text;
    return line;
  }));
  document.querySelector('#key-data').hidden = false;
  document.querySelector('#key-activation').textContent = 'KEY AUTHORITY RECOGNIZED';
  document.body.classList.add('record-recognized');
}
