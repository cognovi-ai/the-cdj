import request from 'supertest';
import app from '../../../src/app';

describe('Journal Entry API Tests', () => {
    const journalId = '65619e89bba77f3e6cff9580';
    const entryId = '65619e89bba77f3e6cff9582';

    it('should deny access to unauthenticated user', async () => {
        const journalId = '6562df0888f144b9ba3bd8e8'; // seed journal id
        const response = await request(app).get(`/journals/${ journalId }/entries`);
        expect(response.statusCode).toBe(401);
    });

    it('should deny adding a new journal entry without authentication', async () => {
        const response = await request(app)
            .post(`/journals/${ journalId }/entries`)
            .send({ title: "Test Entry", content: "This is a test entry." });
        expect(response.statusCode).toBe(401);
    });

    it('should deny retrieving a specific journal entry without authentication', async () => {
        const response = await request(app)
            .get(`/journals/${ journalId }/entries/${ entryId }`);
        expect(response.statusCode).toBe(401);
    });

    it('should deny updating a journal entry without authentication', async () => {
        const response = await request(app)
            .put(`/journals/${ journalId }/entries/${ entryId }`)
            .send({ title: "Updated Title", content: "Updated content." });
        expect(response.statusCode).toBe(401);
    });

    it('should deny deleting a journal entry without authentication', async () => {
        const response = await request(app)
            .delete(`/journals/${ journalId }/entries/${ entryId }`);
        expect(response.statusCode).toBe(401);
    });
});
