const { info, warning } = require('@actions/core');
const { context: githubContext } = require('@actions/github');

const review = require('./reviews');

const run = async ({ fileDiff } = {}) => {
  // run file review
  // info(
  //   `githubContext ${JSON.stringify(githubContext)}`
  // )

  if (['pull_request', 'pull_request_target'].includes(githubContext.eventName)) {
    return review(githubContext);
  }

  warning(
    `Skipped: current event is ${context.eventName}, only support pull_request event`
  )
}

run();

module.exports = run;