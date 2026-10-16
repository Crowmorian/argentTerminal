import { puzzle } from './puzzle-config.js';

const id = new URLSearchParams(location.search).get('key');
const key = puzzle.keys.find(item => item.id === id);
if (!key) {
  document.querySelector('#key-title').textContent = 'Authority unrecognized';
  document.querySelector('#key-error').hidden = false;
} else {
  document.title = `${key.name} authority | ${puzzle.title}`;
  document.querySelector('#key-title').textContent = key.name;
  document.querySelector('#key-designation').textContent = key.designation;
  document.querySelector('#key-sequence').textContent = key.sequence;
  document.querySelector('#key-clue').textContent = key.clue;
  document.querySelector('#key-data').hidden = false;
  const copyButton = document.querySelector('#copy-button');
  if (navigator.clipboard?.writeText) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(key.sequence);
        document.querySelector('#copy-status').textContent = 'CREDENTIAL COPIED';
      } catch {
        document.querySelector('#copy-status').textContent = 'Select and copy the credential above.';
      }
    });
  }
}
