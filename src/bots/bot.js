const { Configuration, OpenAIApi } = require('openai');
const { info, getInput, error } = require('@actions/core');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
class Bot {
  constructor(options) {
    this.options = options;
    if (OPENAI_API_KEY) {
      const configuration = new Configuration({
        apiKey: OPENAI_API_KEY,
      });

      this.api = new OpenAIApi(configuration);
    } else {
      const err = "Unable to initialize the OpenAI API, 'OPENAI_API_KEY' environment variable are not available";
      throw new Error(err);
    }
  }

  async sendMessage({ userPrompt }) {
    // info(`Bot send message: ${userPrompt}`);

    try {
      const systemPrompt = `
      You are \`@openai\` (aka \`github-actions[bot]\`), a language model 
      trained by OpenAI. Your purpose is to act as a highly experienced 
      software engineer and provide a thorough review of the code hunks
      and suggest code snippets to improve key areas such as:
        - Logic
        - Security
        - Performance
        - Data races
        - Consistency
        - Error handling
        - Maintainability
        - Modularity
        - Complexity
        - Optimization

      Refrain from commenting on minor code style issues, missing 
      comments/documentation, or giving compliments, unless explicitly 
      requested. Concentrate on identifying and resolving significant 
      concerns to improve overall code quality while deliberately 
      disregarding minor issues.
      `;

      // const systemPrompt = `
      //   You are highly skilled developer who needs to do review of the code. You need to find potential problems in the
      //   code and comment them.
      // `;

      return await this.request({
        systemPrompt: this.options?.systemMessage || systemPrompt,
        userPrompt,
      });
    } catch (e) {
      error(`Failed to chat: ${e}, backtrace: ${e.stack}`);
      return null;
    }
  }

  async request({ systemPrompt, userPrompt }) {
    info(
      `Requesting data from OpenAI: ${JSON.stringify({
        systemPrompt,
        userPrompt,
        OPENAI_API_KEY: OPENAI_API_KEY.length,
      })}`,
    );

    try {
      const result = await this.api.createChatCompletion({
        model: this.options?.model || 'gpt-3.5-turbo',
        temperature: this.options?.modelTemperature || 0.0,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        // functions: [
        //   {
        //     name: 'comment_on_file',
        //     description: 'Please comment on the line of code',
        //     parameters: {
        //       type: 'object',
        //       properties: {
        //         file: {
        //           type: 'string',
        //           description: 'full path to filename',
        //         },
        //         comments: {
        //           type: 'string',
        //           description: 'json containing objects with <line>, <comment>, <suggestion>',
        //         },
        //       },
        //     },
        //     required: ['file', 'comments'],
        //   },
        // ],
      });

      console.log(result.data.choices);

      return result.data.choices;
    } catch (e) {
      error(`Failed to get OpenAI response: ${e.message}`);
      console.log('Request options: ', {
        model: this.options?.model || 'gpt-3.5-turbo',
        temperature: 0.5,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      return null;
    }
  }
}

module.exports = Bot;
