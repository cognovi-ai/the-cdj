require('dotenv').config();
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');

module.exports = async () => {
  console.log('\nSetup: config mongodb for testing...');
  // https://typegoose.github.io/mongodb-memory-server/docs/guides/integration-examples/test-runners/
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 3 } });
  const uri = replSet.getUri();
  global.__MONGOREPLSET = replSet;
  process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));

  // Make sure the database is empty before running tests.
  const conn = await mongoose.connect(`${process.env.MONGO_URI}/cdj`);
  await conn.connection.db.dropDatabase();
  await mongoose.disconnect();
};
