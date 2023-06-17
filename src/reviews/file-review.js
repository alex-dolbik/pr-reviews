const generateFileReviewPrompt = require("../prompts/file-review-prompt");

class FileReview {
  constructor({ bot }) {
    this.bot = bot;
  }

  async review({ fileDiff }) {
    const fileReviewPrompt = generateFileReviewPrompt(fileDiff)

    const [response] = await this.bot.sendMessage({ userPrompt: fileReviewPrompt })
    return this.parseResponse(response)
  }

  parseResponse(response) {
    const review = JSON.parse((response?.message?.function_call.arguments))
    review.comments = typeof review.comments === 'string' ? JSON.parse(review.comments) : review.comments;

    return review;
  }
}

module.exports = FileReview;