module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'
  },
  globalSetup: '<rootDir>/tests/jest.setup.cjs',
  globalTeardown: '<rootDir>/tests/jest.teardown.cjs'
};
