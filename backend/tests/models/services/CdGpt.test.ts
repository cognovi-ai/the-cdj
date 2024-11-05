import * as CdGptServices from '../../../src/models/services/CdGpt.js';
import CdGpt from '../../../src/assistants/gpts/CdGpt.js';
import { Config } from '../../../src/models/index.js';
import connectDB from '../../../src/db.js';
import mongoose from 'mongoose';

jest.mock('../../../src/assistants/gpts/CdGpt.js');
const mockedCdGpt = jest.mocked(CdGpt);

describe('getAnalysisContent', () => {

  beforeAll(async () => {
    await connectDB('cdj');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect();
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

    const sut = await CdGptServices.getAnalysisContent(mockConfig.id, '');

    expect(sut).toStrictEqual(expectedResult);
  });

  it('throws error if config not set when getting analysis', async () => {
    jest.spyOn(Config, 'findById').mockResolvedValueOnce(null);

    const sut = () => {
      return CdGptServices.getAnalysisContent('', '');
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

    await CdGptServices.getAnalysisContent(mockConfig.id, '');

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

    const sut = () => {
      return CdGptServices.getAnalysisContent(mockConfig.id, '');
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

    const sut = () => {
      return CdGptServices.getAnalysisContent(mockConfig.id, '');
    };

    await expect(sut()).rejects.toThrow('error type');
  });
});