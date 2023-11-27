module.exports = async () => {
  try {
    console.log('\nSetup: Seeding and connecting to the test database');

    // Seed the test database
    const seedModule = await import('../data/seed.js');
    await seedModule.seedDatabase();

    // Connect to the test database
    const dbModule = await import('../src/db.js');
    await dbModule.default('cdj');

    // Retrieve a test journal ID
    const journalModule = await import('../src/models/journal.js');
    const Journal = journalModule.default;
    const journal = await Journal.findOne({});

    // Retrieve a test entry ID
    const entryModule = await import('../src/models/entry/entry.js');
    const Entry = entryModule.default;
    const entries = await Entry.find({});

    // Retrieve a test user email
    const userModule = await import('../src/models/user.js');
    const User = userModule.default;
    const user = await User.findOne({});

    // Set environment variables if data is available
    if (user || journal || (entries && entries.length > 0)) {
      process.env.TEST_USER_EMAIL = user.email;
      process.env.TEST_USER_PASSWORD = 'gobears!2014';
      process.env.TEST_JOURNAL_ID = journal._id.toString();
      process.env.TEST_ENTRY_ID = entries[0]._id.toString();
    }
  } catch (error) {
    // Handle any errors that occur during setup
    console.error('Setup error:', error);
    throw error; // Re-throw the error to fail the test setup
  }
};
