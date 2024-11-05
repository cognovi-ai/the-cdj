import * as CdGptServices from '../../../src/models/services/CdGpt.js';
import { Config, Entry, EntryAnalysis, Journal, User } from '../../../src/models/index.js';
import CdGpt from '../../../src/assistants/gpts/CdGpt.js';
import ExpressError from '../../../src/utils/ExpressError.js';
import connectDB from '../../../src/db.js';
import mongoose from 'mongoose';

jest.mock('../../../src/assistants/gpts/CdGpt.js');
const mockedCdGpt = jest.mocked(CdGpt);

describe('CdGpt Services tests', () => {
  beforeAll(async () => {
    await connectDB('cdj');
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });


  describe('getAnalysisContent', () => {
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
  
  describe('getChatContent tests', () => {
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
  
      const sut = await CdGptServices.getChatContent(
        mockConfig.id,
        mockAnalysis.id,
        ''
      );
  
      expect(sut).toBe(expectedResult);
    });
  
    it('throws error if config not set when getting analysis', async () => {
      jest.spyOn(Config, 'findById').mockResolvedValueOnce(null);
  
      const sut = () => {
        return CdGptServices.getChatContent('', '', '', []);
      };
  
      await expect(sut()).rejects.toThrow(
        'Configure your account settings to get an analysis.'
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
  
      await CdGptServices.getChatContent(mockConfig.id, mockAnalysis.id, '', []);
  
      expect(findByIdAndUpdate).toHaveBeenCalledWith(mockConfig._id, {
        $unset: { apiKey: 1 },
      });
    });
  
    it('should throw an error if OPENAI_API_KEY is not set', async () => {
      const { OPENAI_API_KEY } = process.env;
      delete process.env.OPENAI_API_KEY;
  
      jest.spyOn(Config, 'findById').mockResolvedValueOnce(new Config({ model: {} }));
  
      await expect(CdGptServices.getChatContent('configId', 'analysisId', 'content', []))
        .rejects
        .toThrow('OpenAI API Key not set. Cannot retrieve conversation response');
  
      process.env.OPENAI_API_KEY = OPENAI_API_KEY;
    });
  
    it('should throw an error if response.error is defined', async () => {
      jest.spyOn(Config, 'findById').mockResolvedValueOnce(new Config({ model: {} }));
      mockedCdGpt.prototype.getChatCompletion.mockResolvedValue({
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
      });
  
      await expect(CdGptServices.getChatContent('configId', 'analysisId', 'content', []))
        .rejects
        .toThrow(ExpressError);
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
  
      const sut = () => {
        return CdGptServices.getChatContent(mockConfig.id, mockAnalysis.id, '', []);
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
  
      const sut = () => {
        return CdGptServices.getChatContent(mockConfig.id, mockAnalysis.id, '', []);
      };
  
      await expect(sut()).rejects.toThrow('error type');
    });
  });

});
