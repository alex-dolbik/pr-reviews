const { info } = require('@actions/core');

const { context: githubContext } = require('@actions/github');

const Bot = require('./bots/bot');
const FileReview = require('./reviews/file-review');
const Commenter = require('./github/commenter');
const octokit = require('./github/octokit');

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

  const { data: changedFiles } = await octokit.rest.pulls.listFiles({
    owner: ownerName,
    repo: repoName,
    pull_number: prNumber,
  });

console.log(JSON.stringify(changedFiles));
  const bot = new Bot();
  const fileReview = new FileReview({ bot });

  // await Promise.all(changedFiles.map(async (file) => {
  //   const reviews = await fileReview.review({ fileDiff: {
  //       fileName: file.filename,
  //       diff:
  //   }})
  //   console.log('!!', reviews);
  //
  //   const commenter = new Commenter({
  //     ownerName,
  //     repoName,
  //     prNumber,
  //     commitId,
  //   });
  //
  //
  // }))

}

run();

module.exports = run;