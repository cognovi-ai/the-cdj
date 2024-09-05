require('dotenv').config();
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const mongoose = require('mongoose');

module.exports = async () => {
  console.log('\nSetup: config mongodb for testing...');
  // https://typegoose.github.io/mongodb-memory-server/docs/guides/integration-examples/test-runners/
  const instance = await MongoMemoryServer.create();
  const uri = instance.getUri();
  global.__MONGOINSTANCE = instance;
  process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));

  // Make sure the database is empty before running tests.
  const conn = await mongoose.connect(`${process.env.MONGO_URI}/cdj`);
  await conn.connection.db.dropDatabase();
  await mongoose.disconnect();
};
