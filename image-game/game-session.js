export function validateImageGame(config) {
  if (typeof config.title !== 'string' || !config.title.trim()) throw new Error('A game title is required.');
  if (!Number.isFinite(config.viewSeconds) || config.viewSeconds <= 0) throw new Error('A positive viewing duration is required.');
  if (!Array.isArray(config.rounds) || config.rounds.length !== 3) throw new Error('Exactly three image rounds are required.');
  const ids = new Set();
  for (const round of config.rounds) {
    if (typeof round.id !== 'string' || !round.id || ids.has(round.id)) throw new Error('Round IDs must be unique.');
    if (typeof round.title !== 'string' || !round.title.trim() || typeof round.src !== 'string' || !round.src.trim()) throw new Error('Each round needs a title and image.');
    if (!Array.isArray(round.questions) || round.questions.length !== 5 || Array.from(round.questions).some(item =>
      !item || typeof item.question !== 'string' || !item.question.trim() || typeof item.answer !== 'string' || !item.answer.trim()
    )) throw new Error('Each image needs five questions and answers.');
    ids.add(round.id);
  }
}

export function createImageGameSession(config, now = () => performance.now()) {
  validateImageGame(config);
  const rounds = config.rounds.map(round => ({ ...round, questions: round.questions.map(item => ({ ...item })) }));
  const completed = new Set();
  let phase = 'hub';
  let current = null;
  let deadline = null;

  function expireIfNeeded() {
    if (phase === 'viewing' && now() >= deadline) {
      phase = 'questions';
      deadline = null;
    }
  }

  function getView() {
    expireIfNeeded();
    if (phase === 'hub') return {
      phase, title: config.title,
      rounds: rounds.map(({ id, title }) => ({ id, title, completed: completed.has(id) }))
    };
    const view = { phase, id: current.id, title: current.title };
    if (phase === 'loading' || phase === 'viewing' || phase === 'answers') {
      view.src = current.src;
      view.alt = current.alt || current.title;
    }
    if (phase === 'viewing') view.remainingMs = Math.max(0, deadline - now());
    if (phase === 'questions') view.questions = current.questions.map(({ question }) => ({ question }));
    if (phase === 'answers') view.questions = current.questions.map(item => ({ ...item }));
    return view;
  }

  function chooseRound(id) {
    if (phase !== 'hub') return false;
    const selected = rounds.find(round => round.id === id);
    if (!selected) return false;
    current = selected;
    phase = 'loading';
    deadline = null;
    return true;
  }

  function imageLoaded(id) {
    if (phase !== 'loading' || current.id !== id) return false;
    deadline = now() + config.viewSeconds * 1000;
    phase = 'viewing';
    return true;
  }

  function imageFailed(id) {
    if (phase !== 'loading' || current.id !== id) return false;
    phase = 'error';
    return true;
  }

  function retry() {
    if (phase !== 'error') return false;
    phase = 'loading';
    return true;
  }

  function revealAnswers() {
    expireIfNeeded();
    if (phase !== 'questions') return false;
    completed.add(current.id);
    phase = 'answers';
    return true;
  }

  function backToHub() {
    if (!['answers', 'error', 'loading'].includes(phase)) return false;
    phase = 'hub';
    current = null;
    deadline = null;
    return true;
  }

  return { getView, chooseRound, imageLoaded, imageFailed, retry, revealAnswers, backToHub };
}
