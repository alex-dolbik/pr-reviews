const { error, getBooleanInput } = require('@actions/core');
const axios = require('axios');

class NiBot {
  constructor(options) {
    this.options = options;
    this.debug = getBooleanInput('debug');

    if (!this.options.urlAuthCredentials) {
      error('Chat GPT infra basic auth is not configured');
      throw new Error('Chat GPT infra basic auth is not configured');
    }

    console.log('Chat GPT IA CONF');
    console.log('AAAAATETETDSGFDSG' + process.env.CHAT_GPT_BASIC_AUTH + 'WETOIJEIOSDFJGNJKSGHSDSG');
    console.log(
      'AAAAATETETDSGFDSG' +
        this.options.urlAuthCredentials.username +
        this.options.urlAuthCredentials.password +
        'WETOIJEIOSDFJGNJKSGHSDSG',
    );
  }

  async sendMessage({ fileDiff, fileName }) {
    try {
      const temperature = this.options?.modelTemperature ? Number(this.options?.modelTemperature) : 0.2;
      const model = this.options?.model;
      const fineTune = this.options?.userMessage;

      const payload = {
        config: {
          model,
          temperature,
        },
        pr_diff: fileDiff,
        file_name: fileName,
        fine_tune: fineTune || '',
      };

      return await this.request(payload);
    } catch (e) {
      error(`Failed to chat: ${e}, backtrace: ${e.stack}`);
      return null;
    }
  }

  async request(payload) {
    const { url, urlAuthCredentials } = this.options;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.debug) {
      console.log({ payload });
    }

    return axios
      .post(url, payload, {
        headers,
        auth: urlAuthCredentials,
      })
      .then((response) => {
        return response.data;
      })
      .then((data) => {
        if (this.debug) {
          console.log('Response:', data);
        }
        return data.arguments;
      })
      .catch((e) => {
        console.error('Error:', e.message);
        error(`Failed to get OpenAI response: ${e.message}`);
        return null;
      });
  }
}

module.exports = NiBot;
