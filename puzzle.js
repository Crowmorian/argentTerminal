export function normalizeSequence(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

export function validatePuzzle(config) {
  if (typeof config.lockCode !== 'string' || !/^\d{5}$/.test(config.lockCode)) throw new Error('The lock code must be a string containing exactly five digits.');
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
  if (!Array.isArray(config.order) || config.order.length !== 5 ||
      new Set(config.order).size !== 5 || Array.from(config.order).some(id => !ids.has(id))) {
    throw new Error('The command order must list each key ID exactly once.');
  }
}

export function getOrderedKeys(config) {
  return config.order.map(id => config.keys.find(key => key.id === id));
}

// Membership feedback deliberately ignores position and counts each authority once.
export function getRecognizedAuthorities(entries, keys) {
  const presented = new Set(entries.map(normalizeSequence));
  return keys.filter(key => presented.has(normalizeSequence(key.sequence)));
}

export function isValidAttempt(entries, keys) {
  return Array.isArray(entries) && entries.length === keys.length &&
    keys.every((key, index) => normalizeSequence(entries[index]) === normalizeSequence(key.sequence));
}
