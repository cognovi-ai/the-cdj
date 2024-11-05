/**
 * @jest-environment node
 */

import * as CdGptServices from '../../../../src/models/services/CdGpt.js';
import * as EntryServices from '../../../../src/models/services/entry/entry.js';
import { Config, Entry, EntryAnalysis, EntryConversation, Journal, User } from '../../../../src/models/index.js';
import mongoose, { HydratedDocument } from 'mongoose';
import { ChatMessage } from '../../../../src/models/entry/entryConversation.js';
import { JournalType } from '../../../../src/models/journal.js';
import { UserType } from '../../../../src/models/user.js';
import connectDB from '../../../../src/db.js';

jest.mock('../../../../src/models/services/CdGpt.js');
const mockedCdGptServices = jest.mocked(CdGptServices);

describe('Entry service tests', () => {
  let mockUser: HydratedDocument<UserType>;
  let mockJournal: HydratedDocument<JournalType>;

  beforeAll(async () => {
    await connectDB('cdj');
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await mongoose.connection.dropDatabase();
    mockUser = await User.create({ fname: 'test', lname: 'test', email: 'testEmail@gmail.com' });
    mockJournal = await Journal.create({ user: mockUser.id });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Get Entry service operation tests', () => {
    it('gets no entries in an empty journal', async () => {
      const entries = await EntryServices.getAllEntriesInJournal(mockJournal.id);

      expect(entries).toHaveLength(0);
    });

    it('returns empty list on error when getting all entries', async () => {
      const entries = await EntryServices.getAllEntriesInJournal('bad id');

      expect(entries).toHaveLength(0);
    });

    it('gets all entries in a journal', async () => {
      const mockEntry1 = new Entry({ journal: mockJournal.id, content: 'mock content' });
      const mockEntry2 = new Entry({ journal: mockJournal.id, content: 'mock content' });
      await mockEntry1.save();
      await mockEntry2.save();

      const entries = await EntryServices.getAllEntriesInJournal(mockJournal.id);

      expect(entries).toHaveLength(2);
    });

    it('gets entries from only one journal', async () => {
      const mockJournal2 = new Journal({ user: mockUser.id });
      const mockEntry1 = new Entry({ journal: mockJournal.id, content: 'mock content' });
      const mockEntry2 = new Entry({ journal: mockJournal2.id, content: 'mock content' });
      await mockEntry1.save();
      await mockEntry2.save();

      const entries1 = await EntryServices.getAllEntriesInJournal(mockJournal.id);
      const entries2 = await EntryServices.getAllEntriesInJournal(mockJournal2.id);

      expect(entries1).toHaveLength(1);
      expect(entries2).toHaveLength(1);
    });

    it('gets Entry by entryId populated with EntryAnalysis and EntryConversation', async () => {
      const mockEntry = new Entry({ journal: mockJournal.id, content: 'mock content' });
      const mockAnalysis = new EntryAnalysis({ entry: mockEntry, analysis_content: 'test content', created_at: new Date(0), updated_at: new Date(0) });
      const mockConversation = new EntryConversation({ entry: mockEntry, messages: [] });
      mockEntry.analysis = mockAnalysis.id;
      mockEntry.conversation = mockConversation.id;
      await mockAnalysis.save();
      await mockConversation.save();
      await mockEntry.save();

      const sut = await EntryServices.getPopulatedEntry(mockEntry.id);

      expect(sut?.id).toBe(mockEntry.id);
      expect(sut?.analysis.entry.toString()).toBe(mockEntry.id);
      expect(sut?.analysis.analysis_content).toBe('test content');
      expect(sut?.analysis.created_at).toBeDefined();
      expect(sut?.analysis.updated_at).toBeDefined();
      expect(sut?.conversation.entry.toString()).toBe(mockEntry.id);
      expect(sut?.conversation.messages).toBeDefined();
    });

    it('gets EntryAnalysis by entryId entry populated with Entry', async () => {
      const mockEntry = new Entry({ journal: mockJournal.id, content: 'mock content' });
      const mockAnalysis = new EntryAnalysis({ entry: mockEntry, analysis_content: 'test content', created_at: new Date(0), updated_at: new Date(0) });
      mockEntry.analysis = mockAnalysis.id;
      await mockAnalysis.save();
      await mockEntry.save();

      const sut = await EntryServices.getPopulatedEntryAnalysis(mockEntry.id);

      expect(sut?.id).toBe(mockAnalysis.id);
      expect(sut?.entry.content).toBe('mock content');
      expect(sut?.entry.journal.toString()).toBe(mockJournal.id);
    });

    it('returns null on error when getting populated EntryAnalysis', async () => {
      const sut = await EntryServices.getPopulatedEntryAnalysis('bad id');
    
      expect(sut).toBeNull();
    });

    it('gets EntryConversation by entryId', async () => {
      const mockEntry = new Entry({ journal: mockJournal.id, content: 'mock content' });
      const mockConversation = new EntryConversation({ entry: mockEntry, messages: [] });
      await mockConversation.save();
      await mockEntry.save();

      const sut = await EntryServices.getEntryConversation(mockEntry.id);

      expect(sut?.id).toBe(mockConversation.id);
    });

    it('returns null on error when getting EntryConversation', async () => {
      const sut = await EntryServices.getEntryConversation('bad id');
    
      expect(sut).toBeNull();
    });
  });

  describe('Create operation Entry service tests', () => {
    it('creates Entry with valid journal id, config id, and content', async () => {
      const mockEntryContent = {
        content: 'mock content',
      };
      const mockConfig = await Config.create({ model: {} });
      mockedCdGptServices.getAnalysisContent.mockResolvedValue(undefined);

      const { errMessage, entry: sut } = await EntryServices.createEntry(mockJournal.id, mockConfig.id, mockEntryContent);
      const testAnalysis = await EntryAnalysis.findById(sut.analysis);

      expect(errMessage).toBeUndefined();
      expect(sut.title).toBe('Untitled');
      expect(sut.journal.toString()).toBe(mockJournal.id);
      expect(sut.content).toBe('mock content');
      expect(sut.tags).toStrictEqual([]);
      expect(sut.analysis?.toString()).toBe(testAnalysis?.id);
      expect(testAnalysis?.analysis_content).toBe('Analysis not available');
    });

    it('creates Entry with valid journal id, config id, and content with analysis returned', async () => {
      const mockEntryContent = {
        content: 'mock content',
      };
      const mockConfig = await Config.create({ model: {} });
      const mockAnalysisContent = {
        title: 'Mock Title',
        mood: 'mock mood',
        tags: ['test', 'mock'],
        analysis_content: 'mock analysis content',
      };
      mockedCdGptServices.getAnalysisContent.mockResolvedValue(mockAnalysisContent);

      const { errMessage, entry: sut } = await EntryServices.createEntry(mockJournal.id, mockConfig.id, mockEntryContent);
      const testAnalysis = await EntryAnalysis.findById(sut.analysis);

      expect(errMessage).toBeUndefined();
      expect(sut.title).toBe(mockAnalysisContent.title);
      expect(sut.journal.toString()).toBe(mockJournal.id);
      expect(sut.mood).toBe(mockAnalysisContent.mood);
      expect(sut.content).toBe('mock content');
      expect(sut.tags).toStrictEqual(mockAnalysisContent.tags);
      expect(sut.analysis?.toString()).toBe(testAnalysis?.id);
      expect(testAnalysis?.analysis_content).toBe(mockAnalysisContent.analysis_content);
    });

    it('returns error message when getting analysis content throws error', async () => {
      const mockEntryContent = {
        journal: mockJournal.id,
        content: 'mock content',
      };
      const mockConfig = await Config.create({ model: {} });
      mockedCdGptServices.getAnalysisContent.mockRejectedValue(new Error('test error message'));

      const { errMessage, entry: sut } = await EntryServices.createEntry(mockJournal.id, mockConfig.id, mockEntryContent);
      const testAnalysis = await EntryAnalysis.findById(sut.analysis);

      expect(errMessage).toBe('test error message');
      expect(sut.title).toBe('Untitled');
      expect(sut.journal.toString()).toBe(mockJournal.id);
      expect(sut.mood).toBeUndefined();
      expect(sut.content).toBe('mock content');
      expect(sut.tags).toStrictEqual([]);
      expect(sut.analysis?.toString()).toBe(testAnalysis?.id);
      expect(testAnalysis?.analysis_content).toBe('Analysis not available');
    });

    it('creates and saves EntryConversation with valid input', async () => {
      const mockEntry = new Entry({ journal: mockJournal.id, content: 'mock content' });
      const mockEntryAnalysis = await EntryAnalysis.create({ entry: mockEntry.id });
      mockEntry.analysis = mockEntryAnalysis.id;
      await mockEntry.save();
      const mockConfig = await Config.create({ model: {} });
      const mockMessageData = {
        messages: [
          {
            message_content: 'test message',
            llm_response: 'mock llm response'
          },
        ]
      };
      const mockLlmContent = 'mock llm chat response';
      jest.spyOn(CdGptServices, 'getChatContent').mockResolvedValue(mockLlmContent);
    
      const sut = await EntryServices.createEntryConversation(
        mockEntry.id,
        mockConfig.id,
        mockMessageData
      );

      expect(sut.entry.toString()).toBe(mockEntry.id);
      expect(sut.messages?.length).toBe(1);
      expect((sut.messages as ChatMessage[])[0].message_content).toBe(mockMessageData.messages[0].message_content);
      expect((sut.messages as ChatMessage[])[0].llm_response).toBe(mockLlmContent);
    });

    it('throws error on missing entry when creating EntryConversation', async () => {
      const nonexistentEntry = new Entry({ journal: mockJournal.id, content: 'mock content' });
      const mockConfig = new Config({ model: {} });
      const mockMessageData = {
        messages: [
          {
            message_content: 'test message',
            llm_response: 'mock llm response'
          },
        ]
      };
    
      await expect(EntryServices.createEntryConversation(
        nonexistentEntry.id,
        mockConfig.id,
        mockMessageData
      )).rejects.toThrow('Entry not found.');
    });

    it('throws error on missing entry.analysis when creating EntryConversation', async () => {
      const mockEntry = new Entry({ journal: mockJournal.id, content: 'mock content' });
      await mockEntry.save();
      const mockConfig = new Config({ model: {} });
      const mockMessageData = {
        messages: [
          {
            message_content: 'test message',
            llm_response: 'mock llm response'
          },
        ]
      };
    
      await expect(EntryServices.createEntryConversation(
        mockEntry.id,
        mockConfig.id,
        mockMessageData
      )).rejects.toThrow('Entry analysis not found.');
    });

    it('throws error when new EntryConversation has empty messages', async () => {
      const mockEntry = new Entry({ journal: mockJournal.id, content: 'mock content' });
      const mockEntryAnalysis = await EntryAnalysis.create({ entry: mockEntry.id });
      mockEntry.analysis = mockEntryAnalysis.id;
      await mockEntry.save();
      const mockConfig = new Config({ model: {} });
      const mockMessageData = {
        messages: [
        ]
      };
    
      await expect(EntryServices.createEntryConversation(
        mockEntry.id,
        mockConfig.id,
        mockMessageData
      )).rejects.toThrow('No message to get completion for.');
    });

    it('does not update EntryConversation if llm response is empty', async () => {
      const mockEntry = new Entry({ journal: mockJournal.id, content: 'mock content' });
      const mockEntryAnalysis = await EntryAnalysis.create({ entry: mockEntry.id });
      mockEntry.analysis = mockEntryAnalysis.id;
      await mockEntry.save();
      const mockConfig = await Config.create({ model: {} });
      const mockMessageData = {
        messages: [
          {
            message_content: 'test message',
            llm_response: 'mock llm response'
          },
        ]
      };
      const mockLlmContent = '';
      jest.spyOn(CdGptServices, 'getChatContent').mockResolvedValue(mockLlmContent);
    
      const sut = await EntryServices.createEntryConversation(
        mockEntry.id,
        mockConfig.id,
        mockMessageData
      );

      expect(sut.entry.toString()).toBe(mockEntry.id);
      expect(sut.messages?.length).toBe(1);
      expect((sut.messages as ChatMessage[])[0].message_content).toBe(mockMessageData.messages[0].message_content);
      expect((sut.messages as ChatMessage[])[0].llm_response).toBe(mockMessageData.messages[0].llm_response);
    });
  });

  describe('updateEntry tests', () => {
    it('updates Entry with valid journal id, config id, and content', async () => {
      const mockEntry = new Entry({ journal: mockJournal.id, content: 'mock content' });
      const mockEntryAnalysis = await EntryAnalysis.create({ entry: mockEntry.id });
      mockEntry.analysis = mockEntryAnalysis.id;
      await mockEntry.save();
      const updateContent = {
        content: 'mock content',
        title: 'mock title'
      };
      const mockConfig = await Config.create({ model: {} });
      mockedCdGptServices.getAnalysisContent.mockResolvedValue(undefined);
  
      const { errMessage, entry: sut } = await EntryServices.updateEntry(mockEntry.id, mockConfig.id, updateContent);
      const testAnalysis = await EntryAnalysis.findById(sut.analysis);
  
      expect(errMessage).toBeUndefined();
      expect(sut.title).toBe('Untitled');
      expect(sut.journal.toString()).toBe(mockJournal.id);
      expect(sut.content).toBe('mock content');
      expect(sut.tags).toStrictEqual([]);
      expect(sut.analysis?.toString()).toBe(testAnalysis?.id);
      expect(testAnalysis?.analysis_content).toBe('Analysis not available');
    });
  
    it('updates Entry with valid journal id, config id, and content with analysis returned', async () => {
      const mockEntry = new Entry({ journal: mockJournal.id, content: 'mock content' });
      const mockEntryAnalysis = await EntryAnalysis.create({ entry: mockEntry.id });
      mockEntry.analysis = mockEntryAnalysis.id;
      await mockEntry.save();
      const updateContent = {
        content: 'mock content',
        title: 'mock title'
      };
      const mockConfig = await Config.create({ model: {} });
      const mockAnalysisContent = {
        title: 'Mock Title',
        mood: 'mock mood',
        tags: ['test', 'mock'],
        analysis_content: 'mock analysis content',
      };
      mockedCdGptServices.getAnalysisContent.mockResolvedValue(mockAnalysisContent);
  
      const { errMessage, entry: sut } = await EntryServices.updateEntry(mockEntry.id, mockConfig.id, updateContent);
      const testAnalysis = await EntryAnalysis.findById(sut.analysis);
  
      expect(errMessage).toBeUndefined();
      expect(sut.title).toBe(mockAnalysisContent.title);
      expect(sut.journal.toString()).toBe(mockJournal.id);
      expect(sut.mood).toBe(mockAnalysisContent.mood);
      expect(sut.content).toBe('mock content');
      expect(sut.tags).toStrictEqual(mockAnalysisContent.tags);
      expect(sut.analysis?.toString()).toBe(testAnalysis?.id);
      expect(testAnalysis?.analysis_content).toBe(mockAnalysisContent.analysis_content);
    });
  
    it('returns error message when getting analysis content throws error', async () => {
      const mockEntry = new Entry({ journal: mockJournal.id, content: 'mock content' });
      const mockEntryAnalysis = await EntryAnalysis.create({ entry: mockEntry.id });
      mockEntry.analysis = mockEntryAnalysis.id;
      await mockEntry.save();
      const updateContent = {
        content: 'mock content',
        title: 'mock title'
      };
      const mockConfig = await Config.create({ model: {} });
      mockedCdGptServices.getAnalysisContent.mockRejectedValue(new Error('test error message'));
  
      const { errMessage, entry: sut } = await EntryServices.updateEntry(mockEntry.id, mockConfig.id, updateContent);
      const testAnalysis = await EntryAnalysis.findById(sut.analysis);
  
      expect(errMessage).toBe('test error message');
      expect(sut.title).toBe('Untitled');
      expect(sut.journal.toString()).toBe(mockJournal.id);
      expect(sut.mood).toBeUndefined();
      expect(sut.content).toBe('mock content');
      expect(sut.tags).toStrictEqual([]);
      expect(sut.analysis?.toString()).toBe(testAnalysis?.id);
      expect(testAnalysis?.analysis_content).toBe('Analysis not available');
    });

    it('updates title when content is empty', async () => {
      const mockEntry = new Entry({ journal: mockJournal.id, content: 'mock content' });
      const mockEntryAnalysis = await EntryAnalysis.create({ entry: mockEntry.id });
      mockEntry.analysis = mockEntryAnalysis.id;
      await mockEntry.save();
      const updateContent = {
        title: 'mock title'
      };
      const mockConfig = await Config.create({ model: {} });
  
      const { errMessage, entry: sut } = await EntryServices.updateEntry(mockEntry.id, mockConfig.id, updateContent);
      const testAnalysis = await EntryAnalysis.findById(sut.analysis);
  
      expect(errMessage).toBeUndefined();
      expect(sut.title).toBe(updateContent.title);
      expect(sut.journal.toString()).toBe(mockJournal.id);
      expect(sut.mood).toBeUndefined();
      expect(sut.content).toBe('mock content');
      expect(sut.tags).toStrictEqual([]);
      expect(sut.analysis?.toString()).toBe(testAnalysis?.id);
      expect(testAnalysis?.analysis_content).toBe('Analysis not available');
    });
  });

  describe('Update EntryAnalysis tests', () => {
    it('updates EntryAnalysis', async () => {
      const mockEntry = new Entry({ journal: mockJournal.id, content: 'mock content' });
      const mockEntryAnalysis = await EntryAnalysis.create({ entry: mockEntry.id });
      mockEntry.analysis = mockEntryAnalysis.id;
      await mockEntry.save();
      const updateContent = {
        analysis_content: 'llm updated content',
        title: 'llm updated title',
        mood: 'llm updated mood',
        tags: ['new tag'],
      };
      const mockConfig = await Config.create({ model: {} });
      mockedCdGptServices.getAnalysisContent.mockResolvedValue(updateContent);
  
      const { errMessage, entry: sut } = await EntryServices.updateEntryAnalysis(mockEntry.id, mockConfig.id);
      const testAnalysis = await EntryAnalysis.findById(sut.analysis);
  
      expect(errMessage).toBeUndefined();
      expect(sut.title).toBe(updateContent.title);
      expect(sut.journal.toString()).toBe(mockJournal.id);
      expect(sut.content).toBe('mock content');
      expect(sut.tags).toStrictEqual(updateContent.tags);
      expect(sut.analysis?.toString()).toBe(testAnalysis?.id);
      expect(sut.mood).toBe(updateContent.mood);
      expect(testAnalysis?.analysis_content).toBe(updateContent.analysis_content);
    });
  });
});