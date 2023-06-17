const { info } = require('@actions/core');

const { context: githubContext } = require('@actions/github');

const Bot = require('./bots/bot');
const FileReview = require('./reviews/file-review');
const Commenter = require('./github/commenter');

const run = async ({ fileDiff } = {}) => {
  // run file review
  info(
    `githubContext ${JSON.stringify(githubContext)}`
  )

  const repo = githubContext.payload.repository;
  const ownerName = repo.owner.login;
  const repoName = repo.name;
  const prNumber = githubContext.payload.pull_request.number
  const commitId = githubContext.payload.pull_request.merge_commit_sha

  const bot = new Bot();
  const fileReview = new FileReview({ bot });
  const reviews = await fileReview.review({ fileDiff })
  console.log('!!', reviews);

  const commenter = new Commenter({
    ownerName,
    repoName,
    prNumber,
    commitId,
  });
}

run();

module.exports = run;