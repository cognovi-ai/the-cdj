/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Config } from '../../src/models/index.js';
import { ConfigType } from '../../src/models/config.js';
import mongoose from 'mongoose';

describe('Config model tests', () => {
  beforeAll(async () => {
    const mongoUri = `${process.env.MONGO_URI}/cdj`;
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  const joiConfigPositiveCases = [
    {
      desc: 'properties in model set with only alphanumeric, hyphen or period characters',
      input: {
        model: {
          chat: 'test-chat-llm-1.0',
          analysis: 'test-analysis-llm-1.0',
        },
      },
      expected: {
        model: {
          chat: 'test-chat-llm-1.0',
          analysis: 'test-analysis-llm-1.0',
        },
      },
    },
    {
      desc: 'chat and analysis are empty strings',
      input: {
        model: {
          chat: '',
          analysis: '',
        },
      },
      expected: {
        model: {
          chat: '',
          analysis: '',
        },
      },
    },
    {
      desc: 'chat and analysis are at most 50 characters',
      input: {
        model: {
          chat: 'a'.repeat(50),
          analysis: 'a'.repeat(50),
        },
      },
      expected: {
        model: {
          chat: 'a'.repeat(50),
          analysis: 'a'.repeat(50),
        },
      },
    },
  ];

  it.each(joiConfigPositiveCases)(
    'Config schema validation succeeds when $desc',
    ({ input, expected }) => {
      const { error, value } = Config.joi(input);

      expect(error).toBeUndefined();
      expect(value).toStrictEqual(expected);
    }
  );

  const joiConfigNegativeCases = [
    {
      desc: 'empty object',
      input: {},
      expected: {},
    },
    {
      desc: 'apiKey is set',
      input: {
        model: {
          chat: 'test-chat-llm-1.0',
          analysis: 'test-analysis-llm-1.0',
        },
        apiKey: 'testapikey',
      },
      expected: {
        model: {
          chat: 'test-chat-llm-1.0',
          analysis: 'test-analysis-llm-1.0',
        },
        apiKey: 'testapikey',
      },
    },
    {
      desc: 'created_at is set',
      input: {
        model: {
          chat: 'test-chat-llm-1.0',
          analysis: 'test-analysis-llm-1.0',
        },
        created_at: new Date(0),
      },
      expected: {
        model: {
          chat: 'test-chat-llm-1.0',
          analysis: 'test-analysis-llm-1.0',
        },
        created_at: new Date(0),
      },
    },
    {
      desc: 'updated_at is set',
      input: {
        model: {
          chat: 'test-chat-llm-1.0',
          analysis: 'test-analysis-llm-1.0',
        },
        updated_at: new Date(0),
      },
      expected: {
        model: {
          chat: 'test-chat-llm-1.0',
          analysis: 'test-analysis-llm-1.0',
        },
        updated_at: new Date(0),
      },
    },
    {
      desc: 'model is missing',
      input: {
        apiKey: 'testapikey',
        created_at: new Date(0),
        updated_at: new Date(0),
      },
      expected: {
        apiKey: 'testapikey',
        created_at: new Date(0),
        updated_at: new Date(0),
      },
    },
    {
      desc: 'model is empty',
      input: {
        model: {},
        apiKey: 'testapikey',
        created_at: new Date(0),
        updated_at: new Date(0),
      },
      expected: {
        model: {},
        apiKey: 'testapikey',
        created_at: new Date(0),
        updated_at: new Date(0),
      },
    },
    {
      desc: 'chat has over 50 characters',
      input: {
        model: {
          chat: 'a'.repeat(51),
          analysis: 'test-analysis-llm-1.0',
        },
        apiKey: 'testapikey',
        created_at: new Date(0),
        updated_at: new Date(0),
      },
      expected: {
        model: {
          chat: 'a'.repeat(51),
          analysis: 'test-analysis-llm-1.0',
        },
        apiKey: 'testapikey',
        created_at: new Date(0),
        updated_at: new Date(0),
      },
    },
    {
      desc: 'invalid character in analysis',
      input: {
        model: {
          chat: 'test-chat-llm-1.0',
          analysis: 'test-analysis-llm-@1.0',
        },
        apiKey: 'testapikey',
        created_at: new Date(0),
        updated_at: new Date(0),
      },
      expected: {
        model: {
          chat: 'test-chat-llm-1.0',
          analysis: 'test-analysis-llm-@1.0',
        },
        apiKey: 'testapikey',
        created_at: new Date(0),
        updated_at: new Date(0),
      },
    },
    {
      desc: 'analysis field is missing',
      input: {
        model: {
          chat: 'test-chat-llm-1.0',
        },
        apiKey: 'testapikey',
        created_at: new Date(0),
        updated_at: new Date(0),
      },
      expected: {
        model: {
          chat: 'test-chat-llm-1.0',
        },
        apiKey: 'testapikey',
        created_at: new Date(0),
        updated_at: new Date(0),
      },
    },
    {
      desc: 'model is not an object',
      input: {
        model: `{
          chat: 'test-chat-llm-1.0',
          analysis: 'test-analysis-llm-1.0',
        }`,
        apiKey: 'testapikey',
        created_at: new Date(0),
        updated_at: new Date(0),
      },
      expected: {
        model: `{
          chat: 'test-chat-llm-1.0',
          analysis: 'test-analysis-llm-1.0',
        }`,
        apiKey: 'testapikey',
        created_at: new Date(0),
        updated_at: new Date(0),
      },
    },
  ];

  it.each(joiConfigNegativeCases)(
    'Config schema validation fails when $desc',
    ({ input, expected }) => {
      const { error, value } = Config.joi(input);

      expect(error).toBeDefined();
      expect(value).toStrictEqual(expected);
    }
  );

  it('should update updated_at field before saving', async () => {
    const config: ConfigType = {
      model: {
        chat: 'chat-model',
        analysis: 'analysis-model',
      },
      apiKey: 'some-api-key',
      created_at: new Date(),
      updated_at: new Date(), // Initially set updated_at
    };

    const createdConfig = await Config.create(config);
    
    // Simulate a small delay to check the updated_at change
    await new Promise(resolve => setTimeout(resolve, 100));

    // Modify the config document
    createdConfig.model.analysis = 'testmodel';
    const savedConfig = await createdConfig.save();

    // Ensure that updated_at has been updated after save
    expect(savedConfig.updated_at.getTime()).toBeGreaterThan(config.updated_at.getTime());
  });
});
