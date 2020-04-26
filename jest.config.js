module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  "testMatch": [
      "**/__tests__/**/*.+(ts|tsx|js)"
  ],
  "collectCoverage": true,
  "collectCoverageFrom": [
    "src/**/*.ts?(x)"
  ]
};
