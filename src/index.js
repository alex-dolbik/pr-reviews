const { info, getInput, error } = require('@actions/core');

const { context: githubContext } = require('@actions/github');

// const Bot = require('./bots/bot');
// const FileReview = require('./reviews/file-review');
// const Commenter = require('./github/commenter');

const run = async ({ fileDiff } = {}) => {
  // run file review
  info(
    `githubContext ${JSON.stringify(githubContext)}`
  )

  // const repo = githubContext.repo
  // const prNumber = githubContext.payload.pull_request.number
  //
  // const bot = new Bot();
  // const fileReview = new FileReview({ bot });
  // const reviews = await fileReview.review({ fileDiff })
  // console.log('!!', reviews);
  //
  // const commenter = new Commenter({
  //   repo,
  //   prNumber,
  //   commitId: '1',
  // });
}

run();

console.log('!!!!!!');

module.exports = run;