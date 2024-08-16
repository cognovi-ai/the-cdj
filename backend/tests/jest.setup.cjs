module.exports = async () => {
  console.log('\nSetup: Seeding and connecting to test database...');

  // Connect to and seed the in-memory test database
  (await import('../data/seed.js')).seedDatabase();

  // Retrieve a test journal ID
  const journalModule = await import('../src/models/journal.js');
  const Journal = journalModule.default;
  const journal = await Journal.findOne({});

  // Retrieve a test entry ID
  const entryModule = await import('../src/models/entry/entry.js');
  const Entry = entryModule.default;
  const entries = await Entry.find({});

  // Retrieve a test entry analysis ID
  const entryAnalysisModule = await import(
    '../src/models/entry/entryAnalysis.js'
  );
  const EntryAnalysis = entryAnalysisModule.default;
  const entryAnalysis = await EntryAnalysis.findOne({});

  // Set environment variables
  if (journal || entries.length > 0) {
    process.env.TEST_JOURNAL_ID = journal._id.toString();
    process.env.TEST_ENTRY_ID = entries[0]._id.toString();
    process.env.TEST_ENTRY_ANALYSIS_ID = entryAnalysis._id.toString();
  }
};
