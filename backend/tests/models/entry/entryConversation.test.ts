/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Config,
  Entry,
  EntryAnalysis,
  EntryConversation,
  Journal,
  User,
} from '../../../src/models/index.js';

import CdGpt from '../../../src/assistants/gpts/CdGpt.js';
import ExpressError from '../../../src/utils/ExpressError.js';
import connectDB from '../../../src/db.js';
import mongoose from 'mongoose';

jest.mock('../../../src/assistants/gpts/CdGpt.js');
const mockedCdGpt = jest.mocked(CdGpt);

describe('EntryConversation tests', () => {
  let entryConversationObject: any;
  let expectedResult: any;

  beforeAll(async () => {
    await connectDB('cdj');
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
    entryConversationObject = {
      messages: [
        {
          message_content: 'test message 1',
          llm_response: 'test response 1',
          created_at: new Date(0),
        },
        {
          message_content: 'test message 2',
          llm_response: 'test response 2',
          created_at: new Date(0),
        },
      ],
    };
    expectedResult = {
      messages: [
        {
          message_content: 'test message 1',
          llm_response: 'test response 1',
          created_at: new Date(0),
        },
        {
          message_content: 'test message 2',
          llm_response: 'test response 2',
          created_at: new Date(0),
        },
      ],
    };
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('succeeds with valid input for EntryConversation', () => {
    const { error, value } = EntryConversation.joi(entryConversationObject);

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('does not require messages to be present', () => {
    entryConversationObject = {};
    expectedResult = {};
    const { error, value } = EntryConversation.joi(entryConversationObject);

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('allows messages to be empty list', () => {
    entryConversationObject.messages = [];
    expectedResult.messages = [];

    const { error, value } = EntryConversation.joi(entryConversationObject);

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('returns error if message in messages has undefined message_content', () => {
    entryConversationObject.messages = [{}];
    expectedResult.messages = [{}];

    const { error, value } = EntryConversation.joi(entryConversationObject);

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('returns error if message_content an empty string', () => {
    entryConversationObject.messages = [{ message_content: '' }];
    expectedResult.messages = [{ message_content: '' }];

    const { error, value } = EntryConversation.joi(entryConversationObject);

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('trims whitespace in message_content', () => {
    entryConversationObject.messages = [
      {
        message_content: '  test trim  ',
        llm_response: 'testresponse',
      },
    ];
    expectedResult.messages = [
      {
        message_content: 'test trim',
        llm_response: 'testresponse',
      },
    ];

    const { error, value } = EntryConversation.joi(entryConversationObject);

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('sets default llm_response if empty', () => {
    entryConversationObject.messages = [
      {
        message_content: 'test content',
      },
    ];
    expectedResult.messages = [
      {
        message_content: 'test content',
        llm_response: 'Not connected to LLM',
      },
    ];

    const { error, value } = EntryConversation.joi(entryConversationObject);

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('trims whitespace in llm_response', () => {
    entryConversationObject.messages = [
      {
        message_content: 'test content',
        llm_response: '     test trim    ',
      },
    ];
    expectedResult.messages = [
      {
        message_content: 'test content',
        llm_response: 'test trim',
      },
    ];

    const { error, value } = EntryConversation.joi(entryConversationObject);

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('returns error if created_at not a date', () => {
    entryConversationObject.messages = [
      {
        message_content: 'test message 1',
        llm_response: 'test response 1',
        created_at: 'not date',
      },
    ];
    expectedResult.messages = [
      {
        message_content: 'test message 1',
        llm_response: 'test response 1',
        created_at: 'not date',
      },
    ];

    const { error, value } = EntryConversation.joi(entryConversationObject);

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('succeeds validation with date string and converts to Date type', () => {
    entryConversationObject.messages = [
      {
        message_content: 'test message 1',
        llm_response: 'test response 1',
        created_at: new Date(0).toString(),
      },
    ];
    expectedResult.messages = [
      {
        message_content: 'test message 1',
        llm_response: 'test response 1',
        created_at: new Date(0),
      },
    ];

    const { error, value } = EntryConversation.joi(entryConversationObject);

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('gets chat content for an entry', async () => {
    const mockContent = {
      reframed_thought: 'mock reframing',
      distortion_analysis: 'analysis',
      impact_assessment: 'impact',
      affirmation: 'affirmation',
      is_healthy: true,
    };
    const expectedResult = JSON.stringify({
      ...mockContent,
    });
    mockedCdGpt.prototype.getChatCompletion.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(mockContent),
            role: 'system',
          },
          index: 0,
          finish_reason: '',
        },
      ],
      id: '',
      object: '',
      created: 0,
      model: '',
      usage: {
        prompt_tokens: 1,
        completion_tokens: 1,
        total_tokens: 1,
      },
    });
    const mockConfig = new Config({
      model: {
        analysis: 'test',
      },
    });
    const mockEntry = new Entry({ content: '' });
    const mockAnalysis = new EntryAnalysis({
      entry: mockEntry.id,
      analysis_content: '',
    });
    await mockConfig.save();
    await mockAnalysis.save();
    const mockChat = new EntryConversation({ entry: mockEntry.id });

    const sut = await mockChat.getChatContent(
      mockConfig.id,
      mockAnalysis.id,
      ''
    );

    expect(sut).toBe(expectedResult);
  });

  it('throws error if config not set when getting analysis', async () => {
    jest.spyOn(Config, 'findById').mockResolvedValueOnce(null);
    const mockChat = new EntryConversation({});

    const sut = () => {
      return mockChat.getChatContent('', '', '', []);
    };

    await expect(sut()).rejects.toThrow(
      'Configure your account settings to chat.'
    );
  });

  it('removes API key from legacy config', async () => {
    const mockConfig = new Config({
      model: {
        analysis: 'test',
      },
      apiKey: 'mockKey',
    });
    const findByIdAndUpdate = jest.fn();
    jest.spyOn(Config, 'findById').mockResolvedValueOnce(mockConfig);
    jest
      .spyOn(Config, 'findByIdAndUpdate')
      .mockImplementationOnce(findByIdAndUpdate);
    const mockUser = await User.create({ lname: 'lname', fname: 'fname', email: 'email' });
    const mockJournal = await Journal.create({ user: mockUser.id });
    const mockEntry = await Entry.create({
      journal: mockJournal.id,
      content: 'content',
    });
    const mockAnalysis = await EntryAnalysis.create({ entry: mockEntry.id });
    const mockChat = await EntryConversation.create({ entry: mockEntry.id });

    await mockChat.getChatContent(mockConfig.id, mockAnalysis.id, '', []);

    expect(findByIdAndUpdate).toHaveBeenCalledWith(mockConfig._id, {
      $unset: { apiKey: 1 },
    });
  });

  it('should throw an error if OPENAI_API_KEY is not set', async () => {
    const { OPENAI_API_KEY } = process.env;
    delete process.env.OPENAI_API_KEY;

    jest.spyOn(Config, 'findById').mockResolvedValueOnce(new Config({ model: {} }));

    const entryConversation = new EntryConversation();

    await expect(entryConversation.getChatContent('configId', 'analysisId', 'content', []))
      .rejects
      .toThrow('OpenAI API Key not set. Cannot retrieve conversation response');

    process.env.OPENAI_API_KEY = OPENAI_API_KEY;
  });

  it('should throw an error if response.error is defined', async () => {
    const { OPENAI_API_KEY } = process.env;
    process.env.OPENAI_API_KEY = 'test-api-key';
  
    jest.spyOn(Config, 'findById').mockResolvedValueOnce(new Config({ model: {} }));
    
    const mockPopulate = jest.fn().mockResolvedValue({
      entry: 'mockEntryId',
      analysis_content: 'mockAnalysisContent',
      created_at: new Date(),
      updated_at: new Date()
    });
  
    jest.spyOn(EntryAnalysis, 'findById').mockImplementation(() => ({
      populate: mockPopulate
    }) as any);
  
    jest.spyOn(CdGpt.prototype, 'getChatCompletion').mockResolvedValue({
      id: 'mock-id',
      object: 'chat.completion',
      created: Date.now(),
      model: 'mock-model',
      choices: [],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      },
      error: {
        name: 'ErrorName',
        message: 'test error'
      }
    } as any);
  
    const entryConversation = new EntryConversation();
  
    await expect(entryConversation.getChatContent('configId', 'analysisId', 'content', []))
      .rejects
      .toThrow(ExpressError);

    process.env.OPENAI_API_KEY = OPENAI_API_KEY;
  });

  it('catches string thrown when trying to remove legacy API key', async () => {
    const mockConfig = new Config({
      model: {
        analysis: 'test',
      },
      apiKey: 'mockKey',
    });

    jest.spyOn(Config, 'findById').mockResolvedValueOnce(mockConfig);
    jest
      .spyOn(Config, 'findByIdAndUpdate')
      .mockRejectedValueOnce('string error');
    const mockUser = await User.create({ lname: 'lname', fname: 'fname', email: 'email' });
    const mockJournal = await Journal.create({ user: mockUser.id });
    const mockEntry = await Entry.create({
      journal: mockJournal.id,
      content: 'content',
    });
    const mockAnalysis = await EntryAnalysis.create({ entry: mockEntry.id });
    const mockChat = await EntryConversation.create({ entry: mockEntry.id });

    const sut = () => {
      return mockChat.getChatContent(mockConfig.id, mockAnalysis.id, '', []);
    };

    await expect(sut()).rejects.toThrow('string error');
  });

  it('catches error thrown when trying to remove legacy API key', async () => {
    const mockConfig = new Config({
      model: {
        analysis: 'test',
      },
      apiKey: 'mockKey',
    });

    jest.spyOn(Config, 'findById').mockResolvedValueOnce(mockConfig);
    jest
      .spyOn(Config, 'findByIdAndUpdate')
      .mockRejectedValueOnce(new Error('error type'));
    const mockUser = await User.create({ lname: 'lname', fname: 'fname', email: 'email' });
    const mockJournal = await Journal.create({ user: mockUser.id });
    const mockEntry = await Entry.create({
      journal: mockJournal.id,
      content: 'content',
    });
    const mockAnalysis = await EntryAnalysis.create({ entry: mockEntry.id });
    const mockChat = await EntryConversation.create({ entry: mockEntry.id });

    const sut = () => {
      return mockChat.getChatContent(mockConfig.id, mockAnalysis.id, '', []);
    };

    await expect(sut()).rejects.toThrow('error type');
  });
});
