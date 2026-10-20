export function validateQuiz(config) {
  if (typeof config.title !== 'string' || !config.title.trim()) throw new Error('A quiz title is required.');
  if (!Array.isArray(config.questions) || !config.questions.length) throw new Error('At least one question is required.');
  const ids = new Set();
  for (const question of config.questions) {
    if (typeof question.id !== 'string' || !question.id || ids.has(question.id)) throw new Error('Question IDs must be unique.');
    if (typeof question.text !== 'string' || !question.text.trim()) throw new Error('Question text is required.');
    if (!Array.isArray(question.options) || question.options.length !== 4 ||
        Array.from(question.options).some(option => typeof option !== 'string' || !option.trim()) ||
        new Set(question.options).size !== 4) throw new Error('Each question needs four distinct answer options.');
    if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex > 3) throw new Error('Correct answer must be an index from 0 to 3.');
    ids.add(question.id);
  }
}

export function createQuizSession(config) {
  validateQuiz(config);
  const questions = config.questions.map(question => ({ ...question, options: [...question.options] }));
  let started = false;
  let selectedIndex = null;
  let answers = [];

  function getView() {
    const common = { title: config.title, total: questions.length };
    if (!started) return { ...common, screen: 'start' };
    if (answers.length === questions.length) {
      const results = questions.map((question, index) => ({
        ...question,
        options: [...question.options],
        selectedIndex: answers[index],
        isCorrect: answers[index] === question.correctIndex
      }));
      return { ...common, screen: 'results', results, score: results.filter(result => result.isCorrect).length };
    }
    const { id, text, options } = questions[answers.length];
    // The active view contains no correctness information or previous answers.
    return { ...common, screen: 'question', index: answers.length, selectedIndex, question: { id, text, options: [...options] } };
  }

  function start() {
    if (started) return false;
    started = true;
    return true;
  }

  function select(questionId, index) {
    if (!started || answers.length === questions.length || questions[answers.length].id !== questionId ||
        !Number.isInteger(index) || index < 0 || index > 3) return false;
    selectedIndex = index;
    return true;
  }

  function submit(questionId) {
    if (!started || answers.length === questions.length || questions[answers.length].id !== questionId || selectedIndex === null) return false;
    answers.push(selectedIndex);
    selectedIndex = null;
    return true;
  }

  function reset() {
    started = false;
    selectedIndex = null;
    answers = [];
  }

  return { getView, start, select, submit, reset };
}
