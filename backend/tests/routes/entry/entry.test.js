import request from 'supertest';
import app from '../../../src/app';

describe('Entries Access', () => {
    it('should deny access to unauthenticated user', async () => {
        const journalId = '6562df0888f144b9ba3bd8e8'; // seed journal id
        const response = await request(app).get(`/journals/${ journalId }/entries`);
        expect(response.statusCode).toBe(401);
    });
});