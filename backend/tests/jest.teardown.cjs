require('dotenv').config();

module.exports = async () => {
  console.log('Teardown: Dropping test database...');
  // https://typegoose.github.io/mongodb-memory-server/docs/guides/integration-examples/test-runners/
  if (process.env.MEMORY === "True") { // Config to decide if an mongodb-memory-server instance should be used
    const instance = global.__MONGOINSTANCE;
    await instance.stop();
  }
};
