import Assistant from '../../../src/assistants/Assistant';
import CdGpt from '../../../src/assistants/gpts/CdGpt';

describe('CdGpt Tests', () => {
  it('should create a CdGpt extending Assistant', async () => {
    const cdGpt = new CdGpt(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-1106');
    expect(cdGpt).toBeInstanceOf(Assistant);
  });

  it('should contain two system seed messages', async () => {
    const cdGpt = new CdGpt(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-1106');
    cdGpt.seedMessages();
    expect(cdGpt.messages.length).toBe(2);
  });

  it('should contain three system seed messages', async () => {
    const cdGpt = new CdGpt(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-1106', 'cd', 'You respond like a pirate.');
    cdGpt.seedMessages();
    expect(cdGpt.messages.length).toBe(3);
  });

  it('should contain a user message', async () => {
    const cdGpt = new CdGpt(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-1106');
    cdGpt.seedMessages([{ role: 'user', content: 'I\'m a total failure.' }]);
    expect(cdGpt.messages[2]).toHaveProperty('role', 'user');
  });

  it('should add a user message', async () => {
    const cdGpt = new CdGpt(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-1106');
    cdGpt.seedMessages();
    cdGpt.addUserMessage('I\'m a total failure.');
    expect(cdGpt.messages[2]).toHaveProperty('role', 'user');
  });
});
