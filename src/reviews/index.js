const { warning, info, error } = require('@actions/core');

const octokit = require('../github/octokit');
const Bot = require('../bots/bot');
const FileReview = require('./file-review');
const Commenter = require('../github/commenter');

const parsePatch = (patch) => {
  const hunkInfo = patchStartEndLine(patch);
  if (hunkInfo == null) {
    return null;
  }

  const oldHunkLines = [];
  const newHunkLines = [];

  // let old_line = hunkInfo.old_hunk.start_line
  let newLine = hunkInfo.newHunk.startLine;

  const lines = patch.split('\n').slice(1); // Skip the @@ line

  // Remove the last line if it's empty
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  for (const line of lines) {
    if (line.startsWith('-')) {
      oldHunkLines.push(`${line.substring(1)}`);
      // old_line++
    } else if (line.startsWith('+')) {
      newHunkLines.push(`${newLine}: ${line.substring(1)}`);
      newLine++;
    } else {
      oldHunkLines.push(`${line}`);
      newHunkLines.push(`${newLine}: ${line}`);
      // old_line++
      newLine++;
    }
  }

  return {
    oldHunk: oldHunkLines.join('\n'),
    newHunk: newHunkLines.join('\n'),
  };
};

const patchStartEndLine = (patch) => {
  const pattern = /(^@@ -(\d+),(\d+) \+(\d+),(\d+) @@)/gm;
  const match = pattern.exec(patch);
  if (match != null) {
    const oldBegin = parseInt(match[2]);
    const oldDiff = parseInt(match[3]);
    const newBegin = parseInt(match[4]);
    const newDiff = parseInt(match[5]);
    return {
      oldHunk: {
        startLine: oldBegin,
        endLine: oldBegin + oldDiff - 1,
      },
      newHunk: {
        startLine: newBegin,
        endLine: newBegin + newDiff - 1,
      },
    };
  } else {
    return null;
  }
};

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

  const data = await octokit.repos.compareCommits({
    owner: ownerName,
    repo: repoName,
    base: context.payload.pull_request.base.sha,
    head: context.payload.pull_request.head.sha,
  });

  console.log('compareCommits', data.data.files);

  // await Promise.all(
  //   changedFiles.map(async (item) => {
  //     const contents = await octokit.repos.getContent({
  //       owner: ownerName,
  //       repo: repoName,
  //       path: item.filename,
  //       ref: commitId,
  //     });
  //     if (contents.data != null) {
  //       if (!Array.isArray(contents.data)) {
  //         if (contents.data.type === 'file' && contents.data.content != null) {
  //           const fileContent = Buffer.from(contents.data.content, 'base64').toString();
  //           console.log('fileContent', fileContent);
  //         }
  //       }
  //     }
  //     console.log('contents', item.filename, contents);
  //   }),
  // );

  const bot = new Bot();
  const fileReview = new FileReview({ bot });

  await Promise.all(
    [changedFiles[1]].map(async (file) => {
      const hunkInfo = parsePatch(file.patch);
      console.log('hunkInfo', hunkInfo);

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
