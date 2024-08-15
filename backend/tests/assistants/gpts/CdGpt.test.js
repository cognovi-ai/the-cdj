import Assistant from '../../../src/assistants/Assistant';
import CdGpt from '../../../src/assistants/gpts/CdGpt';

describe('CdGpt Tests', () => {
  it('should create a CdGpt extending Assistant', async () => {
    const cdGpt = new CdGpt(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-1106');
    expect(cdGpt).toBeInstanceOf(Assistant);
  });

  it('should contain two system seed analysis messages', async () => {
    const cdGpt = new CdGpt(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-1106');
    cdGpt.seedAnalysisMessages();
    expect(cdGpt.analysisMessages).toHaveLength(2);
  });

  it('should contain three system seed analysis messages', async () => {
    const cdGpt = new CdGpt(
      process.env.OPENAI_API_KEY,
      'gpt-3.5-turbo-1106',
      'cd',
      'You respond like a pirate.'
    );
    cdGpt.seedAnalysisMessages();
    expect(cdGpt.analysisMessages).toHaveLength(3);
  });

  it('should contain a user analysis message', async () => {
    const cdGpt = new CdGpt(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-1106');
    cdGpt.seedAnalysisMessages([
      { role: 'user', content: 'I\'m a total failure.' },
    ]);
    expect(cdGpt.analysisMessages[2]).toHaveProperty('role', 'user');
  });

  it('should add a user analysis message', async () => {
    const cdGpt = new CdGpt(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-1106');
    cdGpt.seedAnalysisMessages();
    cdGpt.addUserMessage({ analysis: 'I\'m a total failure.' });
    expect(cdGpt.analysisMessages[2]).toHaveProperty('role', 'user');
  });

  it('should contain three seed chat messages', async () => {
    const cdGpt = new CdGpt(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-1106');
    cdGpt.seedChatMessages({
      entry: 'I\'m a total failure.',
      analysis_content: 'This thought contains the cognitive distortion of...',
    });
    expect(cdGpt.chatMessages).toHaveLength(3);
  });

  it('should contain four seed chat messages', async () => {
    const cdGpt = new CdGpt(
      process.env.OPENAI_API_KEY,
      'gpt-3.5-turbo-1106',
      'cd',
      'You respond like a pirate.'
    );
    cdGpt.seedChatMessages({
      entry: 'I\'m a total failure.',
      analysis_content: 'This thought contains the cognitive distortion of...',
    });
    expect(cdGpt.chatMessages).toHaveLength(4);
  });

  it('should contain six seed chat messages', async () => {
    const cdGpt = new CdGpt(
      process.env.OPENAI_API_KEY,
      'gpt-3.5-turbo-1106',
      'You respond like a pirate.'
    );
    cdGpt.seedChatMessages(
      {
        entry: 'I\'m a total failure.',
        analysis_content:
          'This thought contains the cognitive distortion of...',
      },
      [{ role: 'user', content: 'I think you\'re right.' }]
    );
    expect(cdGpt.chatMessages).toHaveLength(6);
  });

  it('should add a user chat message', async () => {
    const cdGpt = new CdGpt(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-1106');
    cdGpt.seedChatMessages({
      entry: 'I\'m a total failure.',
      analysis_content: 'This thought contains the cognitive distortion of...',
    });
    cdGpt.addUserMessage({ chat: 'I think you\'re right.' });
    expect(cdGpt.chatMessages[3]).toHaveProperty('role', 'user');
  });
});
