const { warning, info, error } = require('@actions/core');

const octokit = require('../github/octokit');
const Bot = require('../bots/bot');
const FileReview = require('./file-review');
const Commenter = require('../github/commenter');

async function review(context) {
  if (context.payload.pull_request == null) {
    warning('Skipped: context.payload.pull_request is null');
    return;
  }

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

  console.log('changedFiles', changedFiles);

  await Promise.all(
    changedFiles.map(async (item) => {
      const contents = await octokit.repos.getContent({
        owner: ownerName,
        repo: repoName,
        path: item.filename,
        ref: commitId,
      });
      if (contents.data != null) {
        if (!Array.isArray(contents.data)) {
          if (contents.data.type === 'file' && contents.data.content != null) {
            fileContent = Buffer.from(contents.data.content, 'base64').toString();
          }
        }
      }
      console.log('contents', item.filename, contents);
    }),
  );

  const bot = new Bot();
  const fileReview = new FileReview({ bot });

  await Promise.all(
    [changedFiles[1]].map(async (file) => {
      const review = await fileReview.review({
        fileDiff: {
          fileName: file.filename,
          diff: file.patch,
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
