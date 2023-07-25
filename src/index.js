const { info, warning } = require('@actions/core');
const { context: githubContext } = require('@actions/github');

const PrReview = require('./reviews/pr-review');

const REVIEW_LABEL = 'ai-review';

const run = async () => {
  // run file review
  // info(
  //   `githubContext ${JSON.stringify(githubContext)}`
  // )

  const prLabels = githubContext.payload.pull_request.labels;
  const reviewLabel = REVIEW_LABEL;
  const reviewLabelExists = prLabels.some((label) => label.name === reviewLabel);

  if (!reviewLabelExists) {
    warning(`Skipped: Review label "${reviewLabel}" is not added`);
    return;
  }

  if (['pull_request', 'pull_request_target'].includes(githubContext.eventName)) {
    const reviewer = new PrReview(githubContext);
    return reviewer.review();
  }

  warning(`Skipped: current event is ${githubContext.eventName}, only support pull_request event`);
};

run();

module.exports = run;
