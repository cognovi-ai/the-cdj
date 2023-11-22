import mongoose from 'mongoose';
import { User, Journal, Entry, EntryAnalysis, EntryConversation } from '../src/models/index.js';
import users from './userData.js';
import journalTitles from './journalData.js';
import entries from './entryData.js';
import analyses from './analysisData.js';
import conversations from './conversationData.js';
import bcrypt from 'bcrypt';

// Utility function to create a hashed password
const createHashedPassword = async (password) => {
    // hash password
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    return hash;
};

// Seed function
const seedDatabase = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/cdj');

        // Remove existing data
        await Promise.all([
            User.deleteMany({}),
            Journal.deleteMany({}),
            Entry.deleteMany({}),
            EntryAnalysis.deleteMany({}),
            EntryConversation.deleteMany({})
        ]);

        for (const userData of users) {
            userData.password = await createHashedPassword(userData.password);
            let user = new User(userData);
            user = await user.save();

            let journal = new Journal({ user: user._id, title: journalTitles.shift() });
            journal = await journal.save();

            for (const entryData of entries) {
                let entry = new Entry({ journal: journal._id, ...entryData });
                entry = await entry.save();

                let analysisContent = analyses.shift() || 'Default analysis content for this entry.';
                let analysis = new EntryAnalysis({ entry: entry._id, analysis_content: analysisContent });
                await analysis.save();

                let messages = [];
                for (let i = 0; i < 3; i++) {
                    let conversationData = conversations.shift() || { userMessage: 'Default user message', llmResponse: 'Default LLM response' };
                    messages.push({ message_content: conversationData.userMessage, llm_response: conversationData.llmResponse });
                }

                let conversation = new EntryConversation({
                    entry: entry._id,
                    messages: messages,
                });

                await conversation.save();
            }
        }

        console.log('Database has been seeded successfully.');
    } catch (error) {
        console.error('Error while seeding database:', error);
    } finally {
        await mongoose.disconnect();
    }
};

seedDatabase();
