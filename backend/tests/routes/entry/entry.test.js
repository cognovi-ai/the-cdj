import app from '../../../src/app'
import request from 'supertest'

describe('Journal Entry API Tests', () => {
  const journalId = process.env.TEST_JOURNAL_ID
  const entryId = process.env.TEST_ENTRY_ID

  it('should deny access to unauthenticated user', async () => {
    const response = await request(app).get(`/journals/${ journalId }/entries`)
    expect(response.statusCode).toBe(401)
  })

  it('should deny adding a new journal entry without authentication', async () => {
    const response = await request(app)
      .post(`/journals/${ journalId }/entries`)
      .send({ title: 'Test Entry', content: 'This is a test entry.' })
    expect(response.statusCode).toBe(401)
  })

  it('should deny retrieving a specific journal entry without authentication', async () => {
    const response = await request(app)
      .get(`/journals/${ journalId }/entries/${ entryId }`)
    expect(response.statusCode).toBe(401)
  })

  it('should deny updating a journal entry without authentication', async () => {
    const response = await request(app)
      .put(`/journals/${ journalId }/entries/${ entryId }`)
      .send({ title: 'Updated Title', content: 'Updated content.' })
    expect(response.statusCode).toBe(401)
  })

  it('should deny deleting a journal entry without authentication', async () => {
    const response = await request(app)
      .delete(`/journals/${ journalId }/entries/${ entryId }`)
    expect(response.statusCode).toBe(401)
  })
})
