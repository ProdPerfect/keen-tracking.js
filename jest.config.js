let files;
if (process.env.TEST_ENV) {
  files = `<rootDir>/test/unit/modules/*-${process.env.TEST_ENV}-*.js`;
} else {
  files = '<rootDir>/test/unit/modules/**/*.js';
}

module.exports = {
  automock: false,
  bail: true,
  testEnvironment: process.env.TEST_ENV || 'jsdom',
  testMatch: [files],
  testURL: 'http://localhost',
  setupFiles: [
    './test/setupJest.js',
  ],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!promise-polyfill|whatwg-fetch)/',
  ],
  verbose: true,
};
