const { info, warning, error } = require('@actions/core');
const chunk = require('lodash/chunk');

const octokit = require('./octokit');

const COMMENTS_HANDLED_AT_TIME = 2;

class Commenter {
  constructor({ ownerName, repoName, prNumber, commitId }) {
    this.repo = {
      name: repoName,
      owner: ownerName,
    };
    this.prNumber = prNumber;
    this.commitId = commitId;
  }

  async sendComments({ file, comments }) {
    const chunks = chunk(comments, COMMENTS_HANDLED_AT_TIME);
    for (let i = 0; i < chunks.length; i++) {
      const comments = chunks[i];
      await Promise.allSettled(
        comments.map(({ line, comment, suggestion, explanation }) => {
          const commentData = {
            path: file,
            startLine: line,
            endLine: line,
            message: `${comment}

  ${suggestion ? `**Suggestion**: ${suggestion}` : ''}
  ${explanation ? `**Explanation**: ${explanation}` : ''}`,
          };

          return this.sendComment(commentData).catch(() => {
            error(`Cannot create a comment: ${JSON.stringify(commentData)}`);
          });
        }),
      );
    }
  }

  async cleanBotComments() {
    const comments = await octokit.pulls.listReviewComments({
      owner: this.repo.owner,
      repo: this.repo.name,
      pull_number: this.prNumber,
    });

    const userToResolve = 'github-actions[bot]'; // Replace with the username you want to resolve comments from

    for (const comment of comments.data) {
      if (comment.user?.login === userToResolve) {
        await octokit.pulls.deleteReviewComment({
          owner: this.repo.owner,
          repo: this.repo.name,
          comment_id: comment.id,
          // body: comment.body,
          // event: 'RESOLVE',
        });
      }
    }
  }

  async sendComment(comment) {
    info(
      `Creating new review comment for ${comment.path}:${comment.startLine}-${comment.endLine}: ${comment.message} in ${this.repo.owner}/${this.repo.name}`,
    );
    const commentData = {
      owner: this.repo.owner,
      repo: this.repo.name,
      pull_number: this.prNumber,
      // eslint-disable-next-line camelcase
      commit_id: this.commitId,
      body: comment.message,
      path: comment.path,
      line: comment.endLine,
      position: 1,
    };

    if (comment.endLine && comment.startLine !== comment.endLine) {
      // eslint-disable-next-line camelcase
      commentData.start_side = 'RIGHT';
      // eslint-disable-next-line camelcase
      commentData.start_line = comment.startLine;
    }
    try {
      await octokit.pulls.createReviewComment(commentData);
    } catch (e) {
      error(`Failed to create review comment: ${e}. ${JSON.stringify(commentData)}`);
    }
  }
}

module.exports = Commenter;
