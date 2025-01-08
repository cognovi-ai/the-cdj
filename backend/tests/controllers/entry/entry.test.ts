import * as EntryController from '../../../src/controllers/entry/entry.js';
import * as EntryServices from '../../../src/models/services/entry/entry.js';
import * as Models from '../../../src/models/index.js';
import { Request, Response } from 'express';
import ExpressError from '../../../src/utils/ExpressError.js';

jest.mock('../../../src/models/services/entry/entry.js', () => ({
  createEntry: jest.fn(),
}));
jest.mock('../../../src/models/index.js', () => ({
  Journal: {
    findById: jest.fn(),
  },
}));
jest.mock('../../../src/utils/ExpressError.js');

// Consolidated mock for services
jest.mock('../../../src/models/services/entry/entry.js', () => ({
  getAllEntries: jest.fn(),
  createEntry: jest.fn(),
}));

const mockReq = () => {
  const flashStore: { [key: string]: string[] } = {};
  const req = {} as Partial<Request>;
  req.params = {};
  req.body = {};
  req.flash = jest.fn((errorType?: string, message?: string) => {
    if (errorType && message) flashStore[errorType] = [message];
    return flashStore;
  }) as never;
  return req as Request;
};

const mockRes = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext = (): jest.Mock => jest.fn();

describe('Entry Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllEntries', () => {
    it('should return entries with status 200 when entries exist', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
      
      const res = mockRes();
  
      (EntryServices.getAllEntries as jest.Mock).mockResolvedValue([
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
        flash: {},
      });
    });

    it('should return a flash message when there are no entries', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
      
      const res = mockRes();
  
      (EntryServices.getAllEntries as jest.Mock).mockResolvedValue([]);
  
      await EntryController.getAllEntries(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        entries: [],
        flash: { info: ['Submit your first entry to get started.'] },
      });
    });
  });

  describe('createEntry', () => {
    it('should create an entry successfully and return status 201', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
      req.body = {
        title: 'Test Entry',
        content: 'This is a test entry.',
      };
  
      const res = mockRes();
      const next = mockNext();
  
      (Models.Journal.findById as jest.Mock).mockResolvedValue({
        config: 'testConfigId',
      });
  
      (EntryServices.createEntry as jest.Mock).mockResolvedValue({
        errMessage: null,
        entry: {
          toObject: jest.fn().mockReturnValue({
            title: 'Test Entry',
            content: 'This is a test entry.',
          }),
        },
      });
  
      await EntryController.createEntry(req, res, next);
  
      expect(req.flash).not.toHaveBeenCalledWith('info');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        title: 'Test Entry',
        content: 'This is a test entry.',
        flash: {},
      });
      expect(next).not.toHaveBeenCalled();
    });
  
    it('should return a flash message and 201 status when there is an error message from service', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
      req.body = { title: 'Test Entry', content: 'This is a test entry.' };
    
      const res = mockRes();
      const next = mockNext();
    
      (Models.Journal.findById as jest.Mock).mockResolvedValue({ config: 'testConfigId' });

      (EntryServices.createEntry as jest.Mock).mockResolvedValue({
        errMessage: 'Some warning.',
        entry: { toObject: jest.fn().mockReturnValue({ title: 'Test Entry', content: 'This is a test entry.' }) },
      });
    
      await EntryController.createEntry(req, res, next);
    
      expect(req.flash).toHaveBeenCalledWith('info', 'Some warning.');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        title: 'Test Entry',
        content: 'This is a test entry.',
        flash: { info: ['Some warning.'] },
      });
    });
  
    it('should call next with an error if the journal is not found', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
  
      const res = mockRes();
      const next = mockNext();
  
      (Models.Journal.findById as jest.Mock).mockResolvedValue(null);
      
      await EntryController.createEntry(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });
  
    it('should call next with an error if an exception occurs', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
  
      const res = mockRes();
      const next = mockNext();
  
      (Models.Journal.findById as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );
  
      await EntryController.createEntry(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Database error');
    });
  });
});