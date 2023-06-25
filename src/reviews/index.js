const { warning, info, error, getMultilineInput } = require('@actions/core');

const octokit = require('../github/octokit');
const Bot = require('../bots/bot');
const FileReview = require('./file-review');
const Commenter = require('../github/commenter');
const { parseDiff } = require('../utils/file-diff');
const FilterPath = require('./file-filter');

async function review(context) {
  if (context.payload.pull_request == null) {
    warning('Skipped: context.payload.pull_request is null');
    return;
  }

  const pathFilters = getMultilineInput('path_filters');
  const filesFilter = new FilterPath(pathFilters);

  const repo = context.payload.repository;
  const ownerName = repo.owner.login;
  const repoName = repo.name;
  const prNumber = context.payload.pull_request.number;
  const commitId = context.payload.pull_request.head.sha;

  const { data: changedFiles } = await octokit.rest.pulls.listFiles({
    owner: ownerName,
    repo: repoName,
    pull_number: prNumber,
  });

  const filteredFiles = changedFiles.filter((file) => {
    const isFileTypeAccepted = filesFilter.check(file.filename);
    if (!isFileTypeAccepted) {
      info(`skip for excluded path: ${file.filename}`);
    }

    return isFileTypeAccepted;
  });

  const bot = new Bot();
  const fileReview = new FileReview({ bot });

  await Promise.all(
    filteredFiles.map(async (file) => {
      const hunkInfo = parseDiff(file.patch);
      console.log('hunkInfo', hunkInfo, file.patch);

      const review = await fileReview.review({
        fileDiff: {
          fileName: file.filename,
          diff: hunkInfo.newHunk, // file.patch,
        },
      });
      console.log('Review result:', review);

      if (!review) {
        error(`Cannot get file review`);
        return;
      }

      const commenter = new Commenter({
        ownerName,
        repoName,
        prNumber,
        commitId,
      });

      await commenter.sendReviews(review);
    }),
  );
}

module.exports = review;
