const { warning, info } = require('@actions/core');

const octokit = require("../github/octokit");
const Bot = require("../bots/bot");
const FileReview = require("./file-review");
const Commenter = require("../github/commenter");

async function review(context) {
  if (context.payload.pull_request == null) {
    warning('Skipped: context.payload.pull_request is null')
    return
  }

  const repo = context.payload.repository;
  const ownerName = repo.owner.login;
  const repoName = repo.name;
  const prNumber = context.payload.pull_request.number
  const commitId = context.payload.pull_request.merge_commit_sha

  const { data: changedFiles } = await octokit.rest.pulls.listFiles({
    owner: ownerName,
    repo: repoName,
    pull_number: prNumber,
  });

  const bot = new Bot();
  const fileReview = new FileReview({ bot });

  await Promise.all([changedFiles[1]].map(async (file) => {
    const reviews = await fileReview.review({ fileDiff: {
        fileName: file.filename,
        diff: file.patch,
      }})
    console.log('!!', reviews);

    const commenter = new Commenter({
      ownerName,
      repoName,
      prNumber,
      commitId,
    });

    await commenter.sendReviews(reviews);
  }))
}

module.exports = review;