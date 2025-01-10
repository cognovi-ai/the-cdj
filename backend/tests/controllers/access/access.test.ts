import * as AccessController from '../../../src/controllers/access/access.js';
import * as AccessServices from '../../../src/models/services/access.js';
import { Request, Response } from 'express';
import ExpressError from '../../../src/utils/ExpressError.js';

jest.mock('../../../src/models/index.js', () => ({
  Journal: {
    findById: jest.fn(),
  },
}));

jest.mock('../../../src/utils/ExpressError.js');

// Consolidated mock for services
jest.mock('../../../src/models/services/access.js', () => ({
  updateJournalTitle: jest.fn(),
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

  describe('updateJournal', () => {
    it('should return a success flash message if the journal title is updated', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
      req.body.title = 'testTitle';

      const res = mockRes();
      const next = mockNext();

      (AccessServices.updateJournalTitle as jest.Mock).mockResolvedValueOnce(true);

      await AccessController.updateJournal(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ flash: { success: ['Journal title updated successfully.'] } });
    });

    it('should return an error flash message if the journal title is not updated', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
      req.body.title = 'testTitle';

      const res = mockRes();
      const next = mockNext();

      (AccessServices.updateJournalTitle as jest.Mock).mockResolvedValueOnce(false);

      await AccessController.updateJournal(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 'flash': { 'warning': ['Journal title not updated.'] } });
    });

    it('should call next with an error if an error is thrown', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
      req.body.title = 'testTitle';

      const res = mockRes();
      const next = mockNext();

      (AccessServices.updateJournalTitle as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

      await AccessController.updateJournal(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });

    it('should return an error if an ExpressError is thrown', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
      req.body.title = 'testTitle';

      const res = mockRes();
      const next = mockNext();

      (AccessServices.updateJournalTitle as jest.Mock).mockRejectedValueOnce(new ExpressError('Test error', 400));

      await AccessController.updateJournal(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });
  });
});