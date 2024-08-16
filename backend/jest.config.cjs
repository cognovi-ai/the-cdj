module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest"
  },
  // https://github.com/kulshekhar/ts-jest/issues/1057#issuecomment-1455530737
  moduleNameMapper: {
    "^(\.\.?\/.+)\.jsx?$": "$1"
  },
  globalSetup: "<rootDir>/tests/jest.setup.cjs",
  globalTeardown: "<rootDir>/tests/jest.teardown.cjs"
};
