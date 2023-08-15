const { warning, info, error, getMultilineInput, getInput, getBooleanInput } = require('@actions/core');

const octokit = require('../github/octokit');
const Bot = require('../bots/bot');
const NiBot = require('../bots/ni-bot');
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
    this.debug = getBooleanInput('debug');
    this.enableComment = getBooleanInput('enable_comment');

    const pathFilters = getMultilineInput('path_filters');
    const repo = context.payload.repository;
    this.ownerName = repo.owner.login;
    this.repoName = repo.name;
    this.prNumber = context.payload.pull_request.number;
    this.commitId = context.payload.pull_request.head.sha;

    // const bot = new Bot({
    //   model: getInput('openai_model'),
    //   modelTemperature: getInput('openai_model_temperature'),
    //   systemMessage: getInput('system_message'),
    // });
    const authCredentialsStr = getInput('chat_gpt_infra_basic_auth_creds');
    const [authUserName, authUserPassword] = authCredentialsStr.split(':');
    const niBot = new NiBot({
      model: getInput('openai_model'),
      modelTemperature: getInput('openai_model_temperature'),
      systemMessage: getInput('system_message'),
      userMessage: getInput('user_message'),
      url: getInput('chat_gpt_infra_endpoint'),
      urlAuthCredentials: {
        username: authUserName,
        password: authUserPassword,
      },
    });
    this.fileReview = new FileReview({ bot: niBot });
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
        try {
          const hunkInfo = parseDiff(file.patch);
          if (this.debug) {
            console.log('hunkInfo', file.patch, hunkInfo);
          }

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

          if (this.enableComment) {
            await this.commenter.sendComments(review);
          }
        } catch (e) {
          error(`Cannot review file: ${file.filename}`);
          error(`Error: ${e.message}`);
          console.error(e);
        }
      }),
    );
  }
}

module.exports = PrReview;
