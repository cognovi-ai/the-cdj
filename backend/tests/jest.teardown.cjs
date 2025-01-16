require('dotenv').config();

module.exports = async () => {
  console.log('Teardown: Dropping test database...');
  // https://typegoose.github.io/mongodb-memory-server/docs/guides/integration-examples/test-runners/
  // Stop the MongoMemoryReplSet instance assigned to global variable in jest.setup.cjs
  await global.__MONGOREPLSET.stop();
};
