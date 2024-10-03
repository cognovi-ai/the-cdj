/**
 * @jest-environment node
 */

import { Config, Entry, Journal, User } from "../../../../src/models/index.js";
import mongoose from "mongoose";
import connectDB from "../../../../src/db.js";
import { EntryServices } from "../../../../src/models/services/entry/entry.js";
import { EntryType } from "../../../../src/models/entry/entry.js";

jest.mock("../../../../src/models/entry/entryAnalysis.js");
describe('entry controller tests', () => {
  beforeAll(async () => {
    await connectDB("cdj");
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('gets no entries in an empty journal', async () => {
    const mockUser = new User({ fname: "test", lname: "test" });
    const mockJournal = new Journal({ user: mockUser.id });
    await mockUser.save();
    await mockJournal.save();

    const entries = await EntryServices.getAllEntries(mockJournal.id);

    expect(entries.length).toBe(0);
  });

  it('gets all entries in a journal', async () => {
    const mockUser = new User({ fname: "test", lname: "test" });
    const mockJournal = new Journal({ user: mockUser.id });
    await mockUser.save();
    await mockJournal.save();
    const mockEntry1 = new Entry({ journal: mockJournal.id, content: "mock content" });
    const mockEntry2 = new Entry({ journal: mockJournal.id, content: "mock content" });
    await mockEntry1.save();
    await mockEntry2.save();

    const entries = await EntryServices.getAllEntries(mockJournal.id);

    expect(entries.length).toBe(2);
  });

  it('gets entries from only one journal', async () => {
    const mockUser = new User({ fname: "test", lname: "test" });
    const mockJournal1 = new Journal({ user: mockUser.id });
    const mockJournal2 = new Journal({ user: mockUser.id });
    const mockEntry1 = new Entry({ journal: mockJournal1.id, content: "mock content" });
    const mockEntry2 = new Entry({ journal: mockJournal2.id, content: "mock content" });
    await mockEntry1.save();
    await mockEntry2.save();

    const entries1 = await EntryServices.getAllEntries(mockJournal1.id);
    const entries2 = await EntryServices.getAllEntries(mockJournal2.id);

    expect(entries1.length).toBe(1);
    expect(entries2.length).toBe(1);
  });

  it('can create entry if journal exists', async () => {
    const mockUser = new User({ fname: "test", lname: "test" });
    const mockJournal = new Journal({ user: mockUser.id });
    await mockJournal.save();

    const sut = await EntryServices.canCreateEntry(mockJournal.id);

    expect(sut).toBe(true);
  });

  it('cannot create entry if journal does not exist', async () => {
    const mockUser = new User({ fname: "test", lname: "test" });
    const mockJournal = new Journal({ user: mockUser.id });

    const sut = await EntryServices.canCreateEntry(mockJournal.id);

    expect(sut).toBe(false);
  });

  it('creates entries with valid journal id and content', async () => {
    const mockUser = new User({ fname: "test", lname: "test" });
    const mockConfig = new Config({ model: { chat: 'gpt-3.5-turbo', analysis: 'gpt-4-1106-preview' } });
    const mockJournal = new Journal({ user: mockUser.id, config: mockConfig.id });
    await mockUser.save();
    await mockConfig.save();
    await mockJournal.save();
    const mockEntryContent: EntryType = {
      journal: mockJournal.id,
      content: "mock content",
    };

    const sut = await EntryServices.createEntry(mockJournal.id, mockEntryContent);

    expect(sut.title).toBe("Untitled");
    expect(sut.journal.toString()).toBe(mockJournal.id);
    expect(sut.content).toBe("mock content");
    expect(sut.tags).toStrictEqual([]);
    expect(sut.analysis).toBeUndefined();
  });

  it('creates entries', async () => { });

});