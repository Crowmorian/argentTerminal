export function validateSoundGame(config) {
  if (typeof config.title !== 'string' || !config.title.trim()) throw new Error('A game title is required.');
  if (!Array.isArray(config.sounds) || config.sounds.length !== 10) throw new Error('Exactly ten sounds are required.');
  const ids = new Set();
  for (const sound of config.sounds) {
    if (typeof sound.id !== 'string' || !sound.id || ids.has(sound.id)) throw new Error('Sound IDs must be unique.');
    if (typeof sound.src !== 'string' || !sound.src.trim() || typeof sound.answer !== 'string' || !sound.answer.trim()) throw new Error('Each sound needs a file and an answer.');
    if (!Number.isFinite(sound.volume) || sound.volume < 0 || sound.volume > 1) throw new Error('Each volume must be a number from 0 to 1.');
    ids.add(sound.id);
  }
}

export function createSoundSession(config) {
  validateSoundGame(config);
  const sounds = config.sounds.map(sound => ({ ...sound }));
  let started = false;
  let draft = '';
  let answers = [];

  function getView() {
    const common = { title: config.title, total: sounds.length };
    if (!started) return { ...common, screen: 'start' };
    if (answers.length === sounds.length) return {
      ...common, screen: 'results',
      results: sounds.map((sound, index) => ({ id: sound.id, answer: sound.answer, selectedAnswer: answers[index] }))
    };
    const { id, src, volume } = sounds[answers.length];
    return { ...common, screen: 'sound', index: answers.length, sound: { id, src, volume }, draft };
  }

  function start() {
    if (started) return false;
    started = true;
    return true;
  }

  function edit(soundId, answer) {
    if (!started || answers.length === sounds.length || sounds[answers.length].id !== soundId || typeof answer !== 'string') return false;
    draft = answer;
    return true;
  }

  function submit(soundId) {
    if (!started || answers.length === sounds.length || sounds[answers.length].id !== soundId || !draft.trim()) return false;
    answers.push(draft.trim());
    draft = '';
    return true;
  }

  function reset() {
    started = false;
    draft = '';
    answers = [];
  }

  return { getView, start, edit, submit, reset };
}
