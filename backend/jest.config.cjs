module.exports = {
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'
  },
  globalSetup: '<rootDir>/tests/jest.setup.cjs',
  globalTeardown: '<rootDir>/tests/jest.teardown.cjs'
};
