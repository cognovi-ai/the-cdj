module.exports = async () => {
  console.log('\nSetup: Seeding and connecting to test database')
  const seedModule = await import('../data/seed.js')
  await seedModule.seedDatabase()

  // Connect to test database
  const dbModule = await import('../src/db.js')
  await dbModule.default('cdj')

  // Retrieve a test journal ID
  const journalModule = await import('../src/models/journal.js')
  const Journal = journalModule.default
  const journal = await Journal.findOne({})

  // Retrieve a test entry ID
  const entryModule = await import('../src/models/entry/entry.js')
  const Entry = entryModule.default
  const entries = await Entry.find({})

  // Set environment variables
  if (journal || entries.length > 0) {
    process.env.TEST_JOURNAL_ID = journal._id.toString()
    process.env.TEST_ENTRY_ID = entries[0]._id.toString()
  }
}
