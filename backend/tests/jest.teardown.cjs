module.exports = async () => {
  console.log('Teardown: Dropping test database...')
  const seedModule = await import('../data/seed.js')
  await seedModule.teardownDatabase()
}
