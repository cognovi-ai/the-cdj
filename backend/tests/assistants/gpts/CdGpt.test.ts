import { ChatCompletionResponse, ChatMessage, EntryAnalysis, Message, Prompt } from '../../../src/assistants/gpts/CdGpt.js';
import CdGpt from '../../../src/assistants/gpts/CdGpt.js';

describe('CdGpt Class', () => {
  const bearerToken = 'testBearerToken';
  const model = 'test-model';
  const persona = 'test-persona';
  const temperature = 0.7;

  let cdgpt: CdGpt;

  beforeEach(() => {
    cdgpt = new CdGpt(bearerToken, model, persona, temperature);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('seedAnalysisMessages', () => {
    it('should seed analysis messages correctly', () => {
      cdgpt.seedAnalysisMessages();

      expect(cdgpt.analysisMessages).toEqual([
        { role: 'system', content: expect.any(String) },
        {
          role: 'system',
          content: expect.stringContaining('Format: application/json'),
        },
        {
          role: 'system',
          content: `Persona: ${persona}`,
        },
      ]);
    });

    it('should include additional messages when provided', () => {
      const additionalMessages: Message[] = [
        { role: 'user', content: 'Additional message 1' },
        { role: 'assistant', content: 'Additional message 2' },
      ];

      cdgpt.seedAnalysisMessages(additionalMessages);

      expect(cdgpt.analysisMessages).toEqual([
        { role: 'system', content: expect.any(String) },
        {
          role: 'system',
          content: expect.stringContaining('Format: application/json'),
        },
        {
          role: 'system',
          content: `Persona: ${persona}`,
        },
        ...additionalMessages,
      ]);
    });
  });

  describe('seedChatMessages', () => {
    it('should seed chat messages correctly', () => {
      const entryAnalysis: EntryAnalysis = {
        entry: { content: 'Entry content' },
        analysis_content: 'Analysis content',
      };

      cdgpt.seedChatMessages(entryAnalysis);

      expect(cdgpt.chatMessages).toEqual([
        { role: 'system', content: expect.any(String) },
        { role: 'system', content: `Persona: ${persona}` },
        { role: 'system', content: 'Entry Topic: Entry content' },
        { role: 'system', content: 'Analysis Topic: Analysis content' },
      ]);
    });

    it('should include additional messages when provided', () => {
      const entryAnalysis: EntryAnalysis = {
        entry: { content: 'Entry content' },
        analysis_content: 'Analysis content',
      };

      const additionalMessages: ChatMessage[] = [
        { message_content: 'User message', llm_response: 'Assistant response' },
      ];

      cdgpt.seedChatMessages(entryAnalysis, additionalMessages);

      expect(cdgpt.chatMessages).toEqual([
        { role: 'system', content: expect.any(String) },
        { role: 'system', content: `Persona: ${persona}` },
        { role: 'system', content: 'Entry Topic: Entry content' },
        { role: 'system', content: 'Analysis Topic: Analysis content' },
        { role: 'user', content: 'User message' },
        { role: 'assistant', content: 'Assistant response' },
      ]);
    });
  });

  describe('addUserMessage', () => {
    it('should add analysis message when analysis prompt is provided', () => {
      const prompt: Prompt = { analysis: 'Analysis message' };

      cdgpt.addUserMessage(prompt);

      expect(cdgpt.analysisMessages).toContainEqual({
        role: 'user',
        content: 'Analysis message',
      });
    });

    it('should add chat message when chat prompt is provided', () => {
      const prompt: Prompt = { chat: 'Chat message' };

      cdgpt.addUserMessage(prompt);

      expect(cdgpt.chatMessages).toContainEqual({
        role: 'user',
        content: 'Chat message',
      });
    });
  });

  describe('getAnalysisCompletion', () => {
    it('should fetch analysis completion from API', async () => {
      const mockResponse: ChatCompletionResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: 1620000000,
        model: 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'Analysis response' },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const result = await cdgpt.getAnalysisCompletion();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `${cdgpt.baseUrl}/chat/completions`,
        {
          headers: {
            'Content-Type': cdgpt.contentType,
            Authorization: cdgpt.bearer,
          },
          method: cdgpt.method,
          body: JSON.stringify({
            model: cdgpt.model,
            response_format: { type: 'json_object' },
            temperature: cdgpt.temperature,
            messages: cdgpt.analysisMessages,
          }),
        }
      );
    });
  });

  describe('getChatCompletion', () => {
    it('should fetch chat completion from API', async () => {
      const mockResponse: ChatCompletionResponse = {
        id: 'chatcmpl-456',
        object: 'chat.completion',
        created: 1620000001,
        model: 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'Chat response' },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 15,
          completion_tokens: 5,
          total_tokens: 20,
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const result = await cdgpt.getChatCompletion();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `${cdgpt.baseUrl}/chat/completions`,
        {
          headers: {
            'Content-Type': cdgpt.contentType,
            Authorization: cdgpt.bearer,
          },
          method: cdgpt.method,
          body: JSON.stringify({
            model: cdgpt.model,
            temperature: cdgpt.temperature,
            messages: cdgpt.chatMessages,
          }),
        }
      );
    });
  });
});