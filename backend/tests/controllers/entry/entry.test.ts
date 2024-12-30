import * as EntryController from '../../../src/controllers/entry/entry.js';
import * as EntryServices from '../../../src/models/services/entry/entry.js';
import { NextFunction, Request, Response } from 'express';

// Mock all the service methods used in the controller
jest.mock('../../../src/models/services/entry/entry.js', () => ({
  getAllEntriesInJournal: jest.fn(),
  createEntry: jest.fn(),
  getPopulatedEntry: jest.fn(),
  updateEntry: jest.fn(),
  deleteEntry: jest.fn(),
  getPopulatedEntryAnalysis: jest.fn(),
  updateEntryAnalysis: jest.fn(),
  getEntryConversation: jest.fn(),
  createEntryConversation: jest.fn(),
  updateEntryConversation: jest.fn(),
}));

const mockReq = () => {
  const flashStore: { [key: string]: string[] } = {};
  return {
    params: {},
    body: {},
    flash: jest.fn((key: string, value?: string) => {
      if (value) {
        if (!flashStore[key]) flashStore[key] = [];
        flashStore[key].push(value);
      } else {
        return flashStore[key] || [];
      }
    }),
  } as unknown as Request;
};

const mockRes = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext = () => jest.fn() as NextFunction;

describe('Entry Controller Tests', () => {
  describe('getAllEntries', () => {
    it('should return entries with status 200 when entries exist', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
      
      const res = mockRes();
  
      (EntryServices.getAllEntriesInJournal as jest.Mock).mockResolvedValue([
        { title: 'Entry 1', content: 'Content 1' },
        { title: 'Entry 2', content: 'Content 2' }
      ]);
  
      await EntryController.getAllEntries(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        entries: [
          { title: 'Entry 1', content: 'Content 1' },
          { title: 'Entry 2', content: 'Content 2' }
        ],
        flash: []
      });
    });
  
    it('should flash a message if no entries found', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';

      const res = mockRes();
      const next = mockNext();
  
      (EntryServices.getAllEntriesInJournal as jest.Mock).mockResolvedValue([]);
  
      await EntryController.getAllEntries(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ entries: [], flash: [] });
      expect(req.flash).toHaveBeenCalledWith('info', 'Submit your first entry to get started.');
      expect(next).not.toHaveBeenCalled();
    });
  });
});