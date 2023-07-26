const { info, error, getBooleanInput } = require('@actions/core');

const generateFileReviewPrompt = require('../prompts/file-review-prompt');

class FileReview {
  constructor({ bot }) {
    this.debug = getBooleanInput('debug');
    this.bot = bot;
  }

  async review({ fileDiff }) {
    const fileReviewPrompt = generateFileReviewPrompt(fileDiff);

    try {
      const response = await this.bot.sendMessage({ userPrompt: fileReviewPrompt });
      // console.log(response[0].message?.content);
      if (this.debug) {
        info(`Got file review response: ${JSON.stringify(response)}`);
      }
      if (response?.length) {
        return this.parseResponse(response[0]);
      }
      return null;
    } catch (e) {
      error(`Cannot get response from OpenAI: ${e.message}`);
      return null;
    }
  }

  parseResponse(response) {
    const review = JSON.parse(response?.message?.content);

    return review;
  }
}

module.exports = FileReview;
