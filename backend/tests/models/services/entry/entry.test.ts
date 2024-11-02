/**
 * @jest-environment node
 */

import * as EntryServices from '../../../../src/models/services/entry/entry.js';
import { Config, Entry, EntryAnalysis, EntryConversation, Journal, User } from '../../../../src/models/index.js';
import mongoose, { HydratedDocument } from 'mongoose';
import { EntryType } from '../../../../src/models/entry/entry.js';
import { JournalType } from '../../../../src/models/journal.js';
import { UserType } from '../../../../src/models/user.js';
import connectDB from '../../../../src/db.js';

describe('Entry service tests', () => {
  let mockUser: HydratedDocument<UserType>;
  let mockJournal: HydratedDocument<JournalType>;

  beforeAll(async () => {
    await connectDB('cdj');
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
    mockUser = await User.create({ fname: 'test', lname: 'test', email: 'testEmail@gmail.com' });
    mockJournal = await Journal.create({ user: mockUser.id });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

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

    const sut = await EntryServices.getPopluatedEntryAnalysis(mockEntry.id);

    expect(sut?.id).toBe(mockAnalysis.id);
    expect(sut?.entry.content).toBe('mock content');
    expect(sut?.entry.journal.toString()).toBe(mockJournal.id);
  });

  it('returns null on error when getting populated EntryAnalysis', async () => {
    const sut = await EntryServices.getPopluatedEntryAnalysis('bad id');
    
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

  it('creates Entry with valid journal id, config id, and content', async () => {
    const mockEntryContent: EntryType = {
      journal: mockJournal.id,
      content: 'mock content',
    };
    const mockConfig = await Config.create({ model: {} });
    jest.spyOn(EntryAnalysis.prototype, 'getAnalysisContent').mockResolvedValue(undefined);

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
    const mockEntryContent: EntryType = {
      journal: mockJournal.id,
      content: 'mock content',
    };
    const mockConfig = await Config.create({ model: {} });
    const mockAnalysisContent = {
      title: 'Mock Title',
      mood: 'mock mood',
      tags: ['test', 'mock'],
      analysis_content: 'mock analysis content',
    };
    jest.spyOn(EntryAnalysis.prototype, 'getAnalysisContent').mockResolvedValue(mockAnalysisContent);

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
});