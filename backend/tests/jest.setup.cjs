require('dotenv').config();
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const mongoose = require('mongoose');

module.exports = async () => {
  console.log('\nSetup: config mongodb for testing...');
  // https://typegoose.github.io/mongodb-memory-server/docs/guides/integration-examples/test-runners/
  if (process.env.MEMORY === "True") { // Config to decide if an mongodb-memory-server instance should be used
    // it's needed in global space, because we don't want to create a new instance every test-suite
    const instance = await MongoMemoryServer.create();
    const uri = instance.getUri();
    global.__MONGOINSTANCE = instance;
    process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));
  }

  // The following is to make sure the database is clean before a test suite starts
  const conn = await mongoose.connect(`${process.env.MONGO_URI}/cdj`);
  await conn.connection.db.dropDatabase();
  await mongoose.disconnect();
};
