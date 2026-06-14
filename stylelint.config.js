/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  ignoreFiles: ['dist/**', 'node_modules/**'],
  rules: {
    'selector-class-pattern': [
      '^[a-z][a-zA-Z0-9]*$',
      {
        message: (selector) => {
          const camel = selector
            .replace(/^\./, '')
            .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
            .replace(/^[A-Z]/, (c) => c.toLowerCase())
          return `Expected "${selector}" to be camelCase. Did you mean "${camel}"?`
        },
      },
    ],
    'import-notation': null,
    'scss/at-mixin-argumentless-call-parentheses': null,
    'hue-degree-notation': null,
    'custom-property-empty-line-before': null,
    'declaration-empty-line-before': null,
    'rule-empty-line-before': null,
    'at-rule-empty-line-before': null,
    'comment-empty-line-before': null,
  },
}
