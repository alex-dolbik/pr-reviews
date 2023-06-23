const { warning, info, error } = require('@actions/core');
const { minimatch } = require('minimatch');

export class PathFilter {
  constructor(rules) {
    this.rules = [];
    if (rules) {
      for (const rule of rules) {
        const trimmed = rule?.trim();
        if (trimmed) {
          if (trimmed.startsWith('!')) {
            this.rules.push([trimmed.substring(1).trim(), true]);
          } else {
            this.rules.push([trimmed, false]);
          }
        }
      }
    }
  }

  check(path) {
    if (this.rules.length === 0) {
      return true;
    }

    let included = false;
    let excluded = false;
    let inclusionRuleExists = false;

    for (const [rule, exclude] of this.rules) {
      info(`Path check: path - ${path}; rule - ${rule}; exclude - ${exclude}; result - ${minimatch(path, rule)}`);
      if (minimatch(path, rule)) {
        if (exclude) {
          excluded = true;
        } else {
          included = true;
        }
      }
      if (!exclude) {
        inclusionRuleExists = true;
      }
    }

    return (!inclusionRuleExists || included) && !excluded;
  }
}

module.exports = PathFilter;
