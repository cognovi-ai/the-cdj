import * as EntryController from '../../../src/controllers/entry/entry.js';
import * as EntryServices from '../../../src/models/services/entry/entry.js';
import * as Models from '../../../src/models/index.js';
import { Request, Response } from 'express';
import ExpressError from '../../../src/utils/ExpressError.js';

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

    it('should call next with an error if the journal config is not found', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
  
      const res = mockRes();
      const next = mockNext();
  
      (Models.Journal.findById as jest.Mock).mockResolvedValue({
        config: null,
      });
      
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

  describe('getAnEntry', () => {
    it('should return an entry with status 200 when entry exists', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      
      const res = mockRes();
      const next = mockNext();
  
      (EntryServices.getPopulatedEntry as jest.Mock).mockResolvedValue({
        title: 'Test Entry',
        content: 'This is a test entry.',
      });
  
      await EntryController.getAnEntry(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        title: 'Test Entry',
        content: 'This is a test entry.',
      });
    });

    it('should return null for non-existent entry', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      
      const res = mockRes();
      const next = mockNext();
  
      (EntryServices.getPopulatedEntry as jest.Mock).mockResolvedValue(null);
  
      await EntryController.getAnEntry(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(null);
    });

    it('should call next with an error if an exception occurs', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
  
      const res = mockRes();
      const next = mockNext();
  
      (EntryServices.getPopulatedEntry as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );
  
      await EntryController.getAnEntry(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Database error');
    });
  });

  describe('updateEntry', () => {
    it('should update an entry successfully and return status 200', async () => {
      const entry = { title: 'Updated Entry',
        content: 'This is an updated test entry.', };

      const req = mockReq();
      req.params.entryId = 'testEntryId';
      req.params.journalId = 'testJournalId';
      req.body = entry;
  
      const res = mockRes();
      const next = mockNext();
  
      (Models.Journal.findById as jest.Mock).mockResolvedValue({
        config: 'testConfigId',
      });
  
      (EntryServices.updateEntry as jest.Mock).mockResolvedValue({
        errMessage: null,
        entry: {
          toObject: jest.fn().mockReturnValue(entry),
        },
      });
  
      await EntryController.updateEntry(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        title: 'Updated Entry',
        content: 'This is an updated test entry.',
        flash: {
          'success': ['Successfully updated entry.']
        }
      });
    });
  
    it('should return a flash message and 200 status when there is an error message from service', async () => {
  
      const entry = { title: 'Updated Entry',
        content: 'This is an updated test entry.', };
  
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      req.params.journalId = 'testJournalId';
      req.body = entry;
      
      const res = mockRes();
      const next = mockNext();
      
      (Models.Journal.findById as jest.Mock).mockResolvedValue({ config: 'testConfigId' });
  
      (EntryServices.updateEntry as jest.Mock).mockResolvedValue({
        errMessage: 'Some warning.',
        entry: { toObject: jest.fn().mockReturnValue(entry) },
      });
      
      await EntryController.updateEntry(req, res, next);
      
      expect(req.flash).toHaveBeenCalledWith('info', 'Some warning.');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        title: 'Updated Entry',
        content: 'This is an updated test entry.',
        flash: {
          'success': ['Successfully updated entry.'],
          'info': ['Some warning.']
        }
      });
    });

    it('should call next with an error if the journal is not found', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      req.params.journalId = 'testJournalId';
  
      const res = mockRes();
      const next = mockNext();
  
      (Models.Journal.findById as jest.Mock).mockResolvedValue(null);
      
      await EntryController.updateEntry(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });

    it('should call next with an error if the entry is not found', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      req.params.journalId = 'testJournalId';
  
      const res = mockRes();
      const next = mockNext();
  
      (Models.Journal.findById as jest.Mock).mockResolvedValue({
        config: 'testConfigId',
      });
  
      (EntryServices.updateEntry as jest.Mock).mockResolvedValue({
        errMessage: 'Entry not found.',
        entry: null,
      });
  
      await EntryController.updateEntry(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });
  });

  describe('deleteEntry', () => {
    it('should delete an entry successfully and return status 200', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
  
      const res = mockRes();
      const next = mockNext();
  
      (EntryServices.deleteEntry as jest.Mock).mockResolvedValue(req.params.entryId);
  
      await EntryController.deleteEntry(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        flash: {
          'success': ['Successfully deleted entry.']
        }
      });
    });
  
    it('should call next with an error if the entry is not found', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
  
      const res = mockRes();
      const next = mockNext();
  
      (EntryServices.deleteEntry as jest.Mock).mockRejectedValue(
        new Error('Entry not found.')
      );
  
      await EntryController.deleteEntry(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });

    it('should call next with an error if an exception occurs', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
  
      const res = mockRes();
      const next = mockNext();
  
      (EntryServices.deleteEntry as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );
  
      await EntryController.deleteEntry(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });
  });

  describe('getEntryAnalysis', () => {
    it('should return entry analysis with status 200 when analysis exists', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      
      const res = mockRes();
      const next = mockNext();
  
      (EntryServices.getPopulatedEntryAnalysis as jest.Mock).mockResolvedValue({
        title: 'Test Entry',
        content: 'This is a test entry.',
        analysis: 'This is an analysis of the test entry.',
      });
  
      await EntryController.getEntryAnalysis(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        title: 'Test Entry',
        content: 'This is a test entry.',
        analysis: 'This is an analysis of the test entry.',
      });
    });

    it('should call next with an error if an exception occurs', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
  
      const res = mockRes();
      const next = mockNext();
  
      (EntryServices.getPopulatedEntryAnalysis as jest.Mock).mockResolvedValue(null);
  
      await EntryController.getEntryAnalysis(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });
  });

  describe('updateEntryAnalysis', () => {
    it('should update entry analysis successfully and return status 200', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      req.params.journalId = 'testJournalId';
      req.body = { analysis: 'This is an updated analysis of the test entry.' };
    
      const res = mockRes();
      const next = mockNext();
    
      (Models.Journal.findById as jest.Mock).mockResolvedValue({
        config: 'testConfigId',
      });
    
      (EntryServices.updateEntryAnalysis as jest.Mock).mockResolvedValue({
        errMessage: null,
        entry: {
          toObject: jest.fn().mockReturnValue({
            title: 'Test Entry',
            content: 'This is a test entry.',
            analysis: 'This is an updated analysis of the test entry.',
          }),
        },
      });
    
      await EntryController.updateEntryAnalysis(req, res, next);
    
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        entry: {
          title: 'Test Entry',
          content: 'This is a test entry.',
          analysis: 'This is an updated analysis of the test entry.',
        },
        flash: {
          'success': ['Successfully generated a new analysis.']
        }
      });
    });

    it('should return a flash message and 200 status when there is an error message from service', async () => {
        
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      req.params.journalId = 'testJournalId';
      req.body = { analysis: 'This is an updated analysis of the test entry.' };
        
      const res = mockRes();
      const next = mockNext();
        
      (Models.Journal.findById as jest.Mock).mockResolvedValue({ config: 'testConfigId' });
    
      (EntryServices.updateEntryAnalysis as jest.Mock).mockResolvedValue({
        errMessage: 'Some warning.',
        entry: { toObject: jest.fn().mockReturnValue({
          title: 'Test Entry',
          content: 'This is a test entry.',
          analysis: 'This is an updated analysis of the test entry.',
        }) },
      });
        
      await EntryController.updateEntryAnalysis(req, res, next);
        
      expect(req.flash).toHaveBeenCalledWith('info', 'Some warning.');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        entry: {
          title: 'Test Entry',
          content: 'This is a test entry.',
          analysis: 'This is an updated analysis of the test entry.',
        },
        flash: {
          'success': ['Successfully generated a new analysis.'],
          'info': ['Some warning.']
        }
      });
    });
  
    it('should call next with an error if the journal is not found', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      req.params.journalId = 'testJournalId';
  
      const res = mockRes();
      const next = mockNext();
  
      (Models.Journal.findById as jest.Mock).mockResolvedValue(null);
      
      await EntryController.updateEntryAnalysis(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });

    it('should call next with an error if the entry is not found', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      req.params.journalId = 'testJournalId';
  
      const res = mockRes();
      const next = mockNext();
  
      (Models.Journal.findById as jest.Mock).mockResolvedValue({
        config: 'testConfigId',
      });
  
      (EntryServices.updateEntryAnalysis as jest.Mock).mockResolvedValue({
        errMessage: 'Entry not found.',
        entry: null,
      });

      await EntryController.updateEntryAnalysis(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });

    it('should call next with an error if an exception occurs', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      req.params.journalId = 'testJournalId';
  
      const res = mockRes();
      const next = mockNext();
  
      (Models.Journal.findById as jest.Mock).mockResolvedValue({
        config: 'testConfigId',
      });
  
      (EntryServices.updateEntryAnalysis as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );
  
      await EntryController.updateEntryAnalysis(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });
  });

  describe('getEntryConversation', () => {
    it('should return entry conversation with status 200 when conversation exists', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      
      const res = mockRes();
  
      (EntryServices.getEntryConversation as jest.Mock).mockResolvedValue({
        title: 'Test Entry',
        content: 'This is a test entry.',
        conversation: 'This is a conversation about the test entry.',
      });
  
      await EntryController.getEntryConversation(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        title: 'Test Entry',
        content: 'This is a test entry.',
        conversation: 'This is a conversation about the test entry.',
      });
    });

    it('should return null for non-existent conversation with status 200', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      
      const res = mockRes();
  
      (EntryServices.getEntryConversation as jest.Mock).mockResolvedValue(null);
  
      await EntryController.getEntryConversation(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({});
    });
  });

  describe('createEntryConversation', () => {
    it ('should create an entry conversation successfully and return status 201', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      req.params.journalId = 'testJournalId';
      req.body = { messages: { message_content: 'This is a test message.' } };
      
      const res = mockRes();
      const next = mockNext();

      (Models.Journal.findById as jest.Mock).mockResolvedValue({
        config: 'testConfigId',
      });

      (EntryServices.createEntryConversation as jest.Mock).mockResolvedValue({
        entry: 'testEntryId',
        messages: {
          message_content: 'This is a test message.',
          llm_response: 'This is a test response.',
        },
      });

      await EntryController.createEntryConversation(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        entry: 'testEntryId',
        messages: {
          message_content: 'This is a test message.',
          llm_response: 'This is a test response.',
        },
        flash: {
          'success': ['Successfully created conversation.']
        }
      });
    });

    it ('should return call next with an error if the journal is not found', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      req.params.journalId = 'testJournalId';
      req.body = { messages: { message_content: 'This is a test message.' } };
      
      const res = mockRes();
      const next = mockNext();

      (Models.Journal.findById as jest.Mock).mockResolvedValue(null);

      await EntryController.createEntryConversation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });

    it ('should return call next with an error if messages are not provided', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      req.params.journalId = 'testJournalId';
      req.body = { messages: {} };
      
      const res = mockRes();
      const next = mockNext();

      await EntryController.createEntryConversation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });
  });

  describe('updateEntryConversation', () => {
    it ('should update an entry conversation successfully and return status 200', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      req.params.journalId = 'testJournalId';
      req.body = { messages: { message_content: 'This is an updated test message.' } };
      
      const res = mockRes();
      const next = mockNext();

      (Models.Journal.findById as jest.Mock).mockResolvedValue({
        config: 'testConfigId',
      });

      (EntryServices.updateEntryConversation as jest.Mock).mockResolvedValue({
        entry: 'testEntryId',
        messages: {
          message_content: 'This is an updated test message.',
          llm_response: 'This is an updated test response.',
        },
      });

      await EntryController.updateEntryConversation(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        entry: 'testEntryId',
        messages: {
          message_content: 'This is an updated test message.',
          llm_response: 'This is an updated test response.',
        },
        flash: {}
      });
    });

    it ('should return call next with an error if the journal is not found', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      req.params.journalId = 'testJournalId';
      req.body = { messages: { message_content: 'This is an updated test message.' } };
      
      const res = mockRes();
      const next = mockNext();

      (Models.Journal.findById as jest.Mock).mockResolvedValue(null);

      await EntryController.updateEntryConversation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });

    it ('should return call next with an error if messages are not provided', async () => {
      const req = mockReq();
      req.params.entryId = 'testEntryId';
      req.params.journalId = 'testJournalId';
      req.body = { messages: {} };
      
      const res = mockRes();
      const next = mockNext();

      await EntryController.updateEntryConversation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });
  });
});