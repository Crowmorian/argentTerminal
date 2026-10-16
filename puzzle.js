export function normalizeSequence(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

export function validatePuzzle(config) {
  if (!/^\d{5}$/.test(config.lockCode)) throw new Error('The lock code must contain exactly five digits.');
  if (!Array.isArray(config.keys) || config.keys.length !== 5) throw new Error('Exactly five keys are required.');
  const ids = new Set();
  const sequences = new Set();
  for (const key of config.keys) {
    if (!/^[a-z0-9-]+$/.test(key.id) || ids.has(key.id)) throw new Error('Key IDs must be unique URL-safe identifiers.');
    const sequence = normalizeSequence(key.sequence);
    if (!sequence || sequences.has(sequence)) throw new Error('Key sequences must be present and unique.');
    ids.add(key.id);
    sequences.add(sequence);
  }
}

export function isValidAttempt(entries, keys) {
  return Array.isArray(entries) && entries.length === keys.length &&
    entries.every((entry, index) => normalizeSequence(entry) === normalizeSequence(keys[index].sequence));
}
