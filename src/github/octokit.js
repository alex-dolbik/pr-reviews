const {getInput, warning} = require('@actions/core');
const {Octokit} = require('@octokit/action');
const {retry} = require('@octokit/plugin-retry');
const {throttling} = require('@octokit/plugin-throttling');

const token = getInput('token') || process.env.GITHUB_TOKEN

const RetryAndThrottlingOctokit = Octokit.plugin(throttling, retry)

const octokit = new RetryAndThrottlingOctokit({
  auth: `token ${token}`,
  throttle: {
    onRateLimit: (
      retryAfter,
      options,
      _o,
      retryCount,
    ) => {
      warning(
        `Request quota exhausted for request ${options.method} ${options.url}
Retry after: ${retryAfter} seconds
Retry count: ${retryCount}
`
      )
      return true
    },
    onSecondaryRateLimit: (_retryAfter, options) => {
      warning(
        `SecondaryRateLimit detected for request ${options.method} ${options.url}`
      )
      return true
    }
  },
  retry: {
    doNotRetry: ['429'],
    maxRetries: 10
  }
})

module.exports = octokit