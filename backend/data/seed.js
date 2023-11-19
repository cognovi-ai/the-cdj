import mongoose from 'mongoose';
import { User, Journal, Entry, EntryAnalysis, EntryConversation } from '../src/models/index.js';

// Utility function to create a hashed password
const createHashedPassword = (password) => {
    // In reality, you'd use bcrypt with a salt to hash the password
    return `hashed_${ password }`;
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

        // Create seed data
        for (let i = 1; i <= 5; i++) {
            let user = new User({
                fname: `User${ i }`,
                lname: `Test`,
                dob: new Date(`199${ i }-01-01`),
                username: `user${ i }test`,
                password_hash: createHashedPassword(`password${ i }`),
                password_salt: `salt${ i }`
            });

            user = await user.save();

            let journal = new Journal({
                user: user._id,
                title: `Journal of ${ user.username }`
            });

            journal = await journal.save();

            for (let j = 1; j <= 3; j++) {
                let entry = new Entry({
                    journal: journal._id,
                    title: `Entry ${ j }`,
                    content: `Content for entry ${ j }`,
                    mood: j % 2 === 0 ? 'Happy' : 'Reflective',
                    tags: [`tag${ j }`, `tag${ j + 1 }`]
                });

                entry = await entry.save();

                let analysis = new EntryAnalysis({
                    entry: entry._id,
                    analysis_content: `Analysis for entry ${ j }`
                });

                analysis = await analysis.save();

                let conversation = new EntryConversation({
                    entry: entry._id,
                    messages: [
                        {
                            message_content: `User comment on entry ${ j }`,
                            llm_response: `LLM response on entry ${ j }`,
                        },
                        {
                            message_content: `Another user comment on entry ${ j }`,
                            llm_response: `Another LLM response on entry ${ j }`,
                        }
                    ]
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
