import { Config, Entry, EntryAnalysis, EntryConversation, Journal, User } from '../src/models/index.js';

import analyses from './analysisData.js';
import configData from './configData.js';
import conversations from './conversationData.js';

import entries from './entryData.js';
import journalTitles from './journalData.js';
import mongoose from 'mongoose';
import users from './userData.js';

async function seedUsers() {
  for (const userData of users) {
    await User.register({ email: userData.email, fname: userData.fname, lname: userData.lname }, userData.password);
  }

  return await User.find({});
}

async function seedConfigs() {
  await Config.insertMany(configData);

  return await Config.find({});
}

// Seed function
export async function seedDatabase() {
  try {
    // only connect if not testing otherwise connect to test db
    let mongoURI = process.env.MONGO_URI + "/cdj"; // pulled from compose.yaml env vars 
    if (process.env.NODE_ENV === 'test') { mongoURI = mongoURI + '-test'; }
    await mongoose.connect(mongoURI);

    // Remove existing data
    await Promise.all([
      User.deleteMany({}),
      Config.deleteMany({}),
      Journal.deleteMany({}),
      Entry.deleteMany({}),
      EntryAnalysis.deleteMany({}),
      EntryConversation.deleteMany({})
    ]);

    const users = await seedUsers();
    const configs = await seedConfigs();

    let configIndex = 0;
    for (const user of users) {
      let journal = new Journal({
        user: user._id,
        config: configs[configIndex]._id, // Assign a config ID to the journal
        title: journalTitles.shift()
      });
      journal = await journal.save();

      for (const entryData of entries) {
        let entry = new Entry({ journal: journal._id, ...entryData });
        entry = await entry.save();

        const analysisContent = analyses.shift() || 'Default analysis content for this entry.';
        const analysis = new EntryAnalysis({ entry: entry._id, analysis_content: analysisContent });
        await analysis.save();

        const messages = [];
        for (let i = 0; i < 3; i++) {
          const conversationData = conversations.shift() || { userMessage: 'Default user message', llmResponse: 'Default LLM response' };
          messages.push({ message_content: conversationData.userMessage, llm_response: conversationData.llmResponse });
        }

        const conversation = new EntryConversation({
          entry: entry._id,
          messages
        });

        await conversation.save();
      }

      configIndex = (configIndex + 1) % configs.length;
    }

    console.log('Database has been seeded successfully.');
  } catch (error) {
    console.error('Error while seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Teardown database
export async function teardownDatabase() {
  try {
    // clear contents of database
    const collections = await mongoose.connection.db.collections();

    for (const collection of collections) {
      await collection.drop();
    }

    // close connection
    await mongoose.disconnect();

    console.log('Database has been torn down successfully.');
  } catch (error) {
    console.error('Error during teardown:', error);
  }
}

if (process.env.NODE_ENV !== 'test') seedDatabase();
