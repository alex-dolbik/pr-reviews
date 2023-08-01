const { error, getBooleanInput } = require('@actions/core');
// const fetch = require('node-fetch');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

class NiBot {
  constructor(options) {
    this.options = options;
    this.debug = getBooleanInput('debug');
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
    const url = this.options.url;
    const requestDataJSON = JSON.stringify(payload);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.debug) {
      console.log({ payload });
    }

    return fetch(url, {
      method: 'POST',
      headers,
      body: requestDataJSON,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Request failed with status: ${response.status}`);
        }
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
