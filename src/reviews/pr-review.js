const { warning, info, error, getMultilineInput, getInput } = require('@actions/core');

const octokit = require('../github/octokit');
const Bot = require('../bots/bot');
const FileReview = require('./file-review');
const Commenter = require('../github/commenter');
const { parseDiff } = require('../utils/file-diff');
const FilterPath = require('./file-filter');

class PrReview {
  constructor(context) {
    if (context.payload.pull_request == null) {
      warning('Skipped: context.payload.pull_request is null');
      return;
    }

    const pathFilters = getMultilineInput('path_filters');
    const repo = context.payload.repository;
    this.ownerName = repo.owner.login;
    this.repoName = repo.name;
    this.prNumber = context.payload.pull_request.number;
    this.commitId = context.payload.pull_request.head.sha;

    const bot = new Bot({
      model: getInput('openai_model'),
      modelTemperature: getInput('openai_model_temperature'),
      systemMessage: getInput('system_message'),
    });
    this.fileReview = new FileReview({ bot });
    this.commenter = new Commenter({
      ownerName: this.ownerName,
      repoName: this.repoName,
      prNumber: this.prNumber,
      commitId: this.commitId,
    });
    this.filesFilter = new FilterPath(pathFilters);
  }

  async getChangedFiles() {
    const { data: changedFiles } = await octokit.rest.pulls.listFiles({
      owner: this.ownerName,
      repo: this.repoName,
      pull_number: this.prNumber,
    });

    return changedFiles;
  }

  async review() {
    const changedFiles = await this.getChangedFiles();
    const filteredFiles = changedFiles.filter((file) => {
      const isFileTypeAccepted = this.filesFilter.check(file.filename);
      if (!isFileTypeAccepted) {
        info(`skip for excluded path: ${file.filename}`);
      }

      return isFileTypeAccepted;
    });

    await this.commenter.cleanBotComments();

    await Promise.all(
      filteredFiles.map(async (file) => {
        const hunkInfo = parseDiff(file.patch);
        console.log('hunkInfo', hunkInfo, file.patch);

        const review = await this.fileReview.review({
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

        await this.commenter.sendComments(review);
      }),
    );
  }
}

module.exports = PrReview;
