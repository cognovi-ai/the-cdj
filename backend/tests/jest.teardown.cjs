require('dotenv').config();

module.exports = async () => {
  console.log('Teardown: Dropping test database...');
  // https://typegoose.github.io/mongodb-memory-server/docs/guides/integration-examples/test-runners/
  const instance = global.__MONGOINSTANCE;
  await instance.stop();
};
