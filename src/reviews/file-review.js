const { info, error } = require('@actions/core');

const generateFileReviewPrompt = require('../prompts/file-review-prompt');

class FileReview {
  constructor({ bot }) {
    this.bot = bot;
  }

  async review({ fileDiff }) {
    const fileReviewPrompt = generateFileReviewPrompt(fileDiff);

    info(`Request file review: ${fileReviewPrompt}`);

    try {
      const response = await this.bot.sendMessage({ userPrompt: fileReviewPrompt });
      info(`Got file review response: ${JSON.stringify(response)}`);
      if (response?.length) {
        return this.parseResponse(response[0]);
      }
      return [];
    } catch (e) {
      error(`Cannot get response from OpenAI: ${e.message}`);
      return [];
    }
  }

  parseResponse(response) {
    const review = JSON.parse(response?.message?.function_call.arguments);
    review.comments = typeof review.comments === 'string' ? JSON.parse(review.comments) : review.comments;

    return review;
  }
}

module.exports = FileReview;
