import ChatAssistant from '../../src/assistants/Assistant';

describe('Chat Assistant Tests', () => {
  it('should return data with a list of models', async () => {
    const assistant = new ChatAssistant(process.env.OPENAI_API_KEY);
    const response = await assistant.testConnection();
    expect(response).toHaveProperty('data');
  });

  it('should return one model', async () => {
    const assistant = new ChatAssistant(
      process.env.OPENAI_API_KEY,
      'Text-Davinci-003'
    );
    const response = await assistant.testConnection();
    const model = assistant.testModelAvailability(response.data);
    expect(model.length).toBe(1);
  });

  it('should return a list of models', async () => {
    const assistant = new ChatAssistant(process.env.OPENAI_API_KEY);
    const response = await assistant.testConnection();
    const models = assistant.testModelAvailability(response.data);
    expect(models.length).toBeGreaterThan(1);
  });
});
