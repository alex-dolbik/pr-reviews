const {info, warning} = require('@actions/core');

const octokit = require("./octokit");

class Commenter {
  constructor({ repo, prNumber, commitId }) {
    this.repo = repo;
    this.prNumber = prNumber;
    this.commitId = commitId;
  }

  async sendReview(reviews) {
    return await Promise.all(reviews.map(review => {
      return this.sendReviewComment({
        path: review.file,
        startLine: review.comment.line,
        message: review.comment.comment,
      })
    }))
  }

  async sendReviewComment({ comment }) {
    info(
      `Creating new review comment for ${comment.path}:${comment.startLine}-${comment.endLine}: ${comment.message}`
    )
    const commentData = {
      owner: this.repo.owner,
      repo: this.repo.repo,
      pull_number: this.prNumber,
      // eslint-disable-next-line camelcase
      commit_id: this.commitId,
      body: comment.message,
      path: comment.path,
      line: comment.endLine
    }

    if (comment.endLine && comment.startLine !== comment.endLine) {
      // eslint-disable-next-line camelcase
      commentData.start_side = 'RIGHT'
      // eslint-disable-next-line camelcase
      commentData.start_line = comment.startLine
    }
    try {
      await octokit.pulls.createReviewComment(commentData)
    } catch (e) {
      warning(`Failed to create review comment: ${e}`)
    }
  }
}

module.exports = Commenter;