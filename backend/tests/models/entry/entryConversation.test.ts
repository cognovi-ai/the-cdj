/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EntryConversation,
} from '../../../src/models/index.js';

import connectDB from '../../../src/db.js';
import mongoose from 'mongoose';


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
});
