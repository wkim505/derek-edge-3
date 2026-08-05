import { sampleRUM } from '../../scripts/aem.js';

const DEFAULTS = {
  question: 'Was this information helpful?',
  positive: 'Thanks for your feedback.',
  negative: 'We\'re sorry this page wasn\'t helpful. Thanks for telling us.',
};

// The Yes/No labels are the values reported to analytics, so they are not authorable.
const ANSWERS = [
  { label: 'Yes', value: 'yes', response: 'positive' },
  { label: 'No', value: 'no', response: 'negative' },
];

let instanceCount = 0;

/**
 * Reads the authored rows in order, falling back to the defaults for rows that are
 * empty or absent altogether.
 * @param {Element} block
 * @returns {{question: string, positive: string, negative: string}}
 */
function readFields(block) {
  const [question, positive, negative] = [...block.children]
    .map((row) => row.textContent.trim());
  return {
    question: question || DEFAULTS.question,
    positive: positive || DEFAULTS.positive,
    negative: negative || DEFAULTS.negative,
  };
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const fields = readFields(block);

  instanceCount += 1;
  const questionId = `page-feedback-question-${instanceCount}`;

  const question = document.createElement('p');
  question.className = 'page-feedback-question';
  question.id = questionId;
  question.textContent = fields.question;

  // A group labelled by the question, so each button is announced with the question
  // that gives it meaning. No heading is emitted: the block can be placed anywhere
  // and must not alter the page's heading outline.
  const actions = document.createElement('div');
  actions.className = 'page-feedback-actions';
  actions.setAttribute('role', 'group');
  actions.setAttribute('aria-labelledby', questionId);

  // Present from decoration time and empty: a live region inserted at the moment of
  // the change is not reliably announced. Focusable so that removing the controls does
  // not drop focus to the top of the page.
  const status = document.createElement('p');
  status.className = 'page-feedback-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('tabindex', '-1');

  ANSWERS.forEach(({ label, value, response }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button secondary';
    button.textContent = label;
    button.addEventListener('click', () => {
      sampleRUM('feedback', { source: 'page-feedback', target: value });
      actions.remove();
      status.textContent = fields[response];
      status.focus();
    });
    actions.append(button);
  });

  block.textContent = '';
  block.append(question, actions, status);
}
