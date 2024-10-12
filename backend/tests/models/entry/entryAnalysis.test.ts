/* @jest-environment node */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Config, EntryAnalysis } from '../../../src/models/index.js';
import CdGpt from '../../../src/assistants/gpts/CdGpt.js';
import connectDB from '../../../src/db.js';
import mongoose from 'mongoose';

jest.mock('../../../src/assistants/gpts/CdGpt.js');
const mockedCdGpt = jest.mocked(CdGpt);

describe('EntryAnalysis Model Test', () => {
  let entryAnalysisObject: any;
  let expectedResult: any;

  beforeAll(async () => {
    jest.clearAllMocks();
    await connectDB('cdj');
  });

  beforeEach(() => {
    entryAnalysisObject = {
      analysis_content: 'test analysis content',
    };
    expectedResult = {
      analysis_content: 'test analysis content',
    };
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('succeeds on valid analysis_content ', () => {
    const { error, value } = EntryAnalysis.joi(entryAnalysisObject);

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('allows empty string for analysis_content and replaces with default', () => {
    entryAnalysisObject.analysis_content = '';
    expectedResult.analysis_content = 'Analysis not available';
    const { error, value } = EntryAnalysis.joi(entryAnalysisObject);

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('trims whitespace from analysis_content', () => {
    entryAnalysisObject.analysis_content = 'test content'
      .padEnd(100, ' ')
      .padStart(100, ' ');
    expectedResult.analysis_content = 'test content';
    const { error, value } = EntryAnalysis.joi(entryAnalysisObject);

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('allows arbitrary length for analysis_content', () => {
    const MAX_NODE_STRING_LENGTH = 2 ** 29 - 24;
    entryAnalysisObject.analysis_content = 'a'.repeat(MAX_NODE_STRING_LENGTH);
    expectedResult.analysis_content = 'a'.repeat(MAX_NODE_STRING_LENGTH);
    const { error, value } = EntryAnalysis.joi(entryAnalysisObject);

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('returns error if analysis_content not a string', () => {
    entryAnalysisObject.analysis_content = true;
    expectedResult.analysis_content = true;
    const { error, value } = EntryAnalysis.joi(entryAnalysisObject);

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('returns error if property not in schema passed in', () => {
    entryAnalysisObject.invalid_property = true;
    expectedResult.invalid_property = true;
    const { error, value } = EntryAnalysis.joi(entryAnalysisObject);

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('gets analysis content from an entry', async () => {
    const mockContent = {
      reframed_thought: 'mock reframing',
      distortion_analysis: 'analysis',
      impact_assessment: 'impact',
      affirmation: 'affirmation',
      is_healthy: true,
    };
    const expectedResult = {
      analysis_content: 'affirmation',
      ...mockContent,
    };
    mockedCdGpt.prototype.getAnalysisCompletion.mockResolvedValue({
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
    await mockConfig.save();
    const mockAnalysis = new EntryAnalysis({});

    const sut = await mockAnalysis.getAnalysisContent(mockConfig.id, '');

    expect(sut).toStrictEqual(expectedResult);
  });

  it('throws error if config not set when getting analysis', async () => {
    jest.spyOn(Config, 'findById').mockResolvedValueOnce(null);
    const mockAnalysis = new EntryAnalysis({});

    const sut = () => {
      return mockAnalysis.getAnalysisContent('', '');
    };

    await expect(sut()).rejects.toThrow(
      'Configure your account settings to get an analysis.'
    );
  });

  it('rmeoves API key from legacy config', async () => {
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
    const mockAnalysis = new EntryAnalysis({});

    await mockAnalysis.getAnalysisContent(mockConfig.id, '');

    expect(findByIdAndUpdate).toHaveBeenCalledWith(mockConfig._id, {
      $unset: { apiKey: 1 },
    });
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
    const mockAnalysis = new EntryAnalysis({});

    const sut = () => {
      return mockAnalysis.getAnalysisContent(mockConfig.id, '');
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
    const mockAnalysis = new EntryAnalysis({});

    const sut = () => {
      return mockAnalysis.getAnalysisContent(mockConfig.id, '');
    };

    await expect(sut()).rejects.toThrow('error type');
  });
});
