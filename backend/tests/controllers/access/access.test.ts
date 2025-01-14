/* eslint-disable @typescript-eslint/no-unused-vars */

import * as AccessController from '../../../src/controllers/access/access.js';
import * as AccessServices from '../../../src/models/services/access.js';
import * as Models from '../../../src/models/index.js';
import { Request, Response } from 'express';
import ExpressError from '../../../src/utils/ExpressError.js';
import passport from 'passport';

jest.mock('../../../src/models/index.js', () => ({
  Journal: {
    findById: jest.fn(),
  },
  User: {
    findOne: jest.fn(),
  }
}));

jest.mock('../../../src/utils/ExpressError.js');

// Mock passport authenticate for login
jest.mock('passport', () => ({
  authenticate: jest.fn((strategy, callback) => {
    return (req: Request, res: Response, next: never) => {
      const mockUser = { id: 'testUserId', fname: 'Test' };
      callback(null, mockUser, null);
    };
  }),
}));

// Consolidated mock for services
jest.mock('../../../src/models/services/access.js', () => ({
  updateJournalTitle: jest.fn(),
  getAccount: jest.fn(),
  updateProfile: jest.fn(),
  updatePassword: jest.fn(),
  updateConfig: jest.fn(),
  deleteConfig: jest.fn(),
  deleteAccount: jest.fn(),
  ensureJournalExists: jest.fn(),
  getPopulatedJournal: jest.fn(),
}));

const mockReq = () => {
  const flashStore: { [key: string]: string[] } = {};
  const req = {} as Partial<Request>;
  req.params = {};
  req.query = {};
  req.body = {};
  req.flash = jest.fn((errorType?: string, message?: string) => {
    if (errorType && message) flashStore[errorType] = [message];
    return flashStore;
  }) as never;
  req.logIn = jest.fn((user, callback) => {
    if (!user) {
      return callback(new Error('Failed to log in.'));
    } else {
      return callback(null);
    }
  }) as jest.Mock;
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

  describe('getAccount', () => {
    it('should return the account with config and user documents', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
    
      const res = mockRes();
      const next = mockNext();
    
      (AccessServices.getAccount as jest.Mock).mockResolvedValue({
        configMessage: null,
        user: { _id: 'testUserId', name: 'Test User' },
        config: { _id: 'testConfigId', settings: {} },
      });
    
      await AccessController.getAccount(req, res, next);
    
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: { _id: 'testUserId', name: 'Test User' },
        config: { _id: 'testConfigId', settings: {} },
        flash: {},
      });
    });

    it('should return an info flash message if configMessage is not null', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
    
      const res = mockRes();
      const next = mockNext();
    
      (AccessServices.getAccount as jest.Mock).mockResolvedValue({
        configMessage: 'Test config message',
        user: { _id: 'testUserId', name: 'Test User' },
        config: { _id: 'testConfigId', settings: {} },
      });
    
      await AccessController.getAccount(req, res, next);
    
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: { _id: 'testUserId', name: 'Test User' },
        config: { _id: 'testConfigId', settings: {} },
        flash: { info: ['Test config message'] },
      });
    });

    it('should call next with an error if an error is thrown', async () => {
      const req = mockReq();
      req.params.accountId = 'testAccountId';

      const res = mockRes();
      const next = mockNext();

      (AccessServices.getAccount as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

      await AccessController.getAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });
  });

  describe('updateAccount', () => {
    let req: ReturnType<typeof mockReq>;
    let res: ReturnType<typeof mockRes>;
    let next: jest.Mock;
  
    beforeEach(() => {
      jest.clearAllMocks();
      req = mockReq();
      res = mockRes();
      next = mockNext();
    });
  
    it('should update the password successfully', async () => {
      req.params.journalId = 'testJournalId';
      req.body.password = { oldPassword: 'oldPass', newPassword: 'newPass' };
  
      const journalMock = { _id: 'testJournalId', user: 'testUserId' };
      (Models.Journal.findById as jest.Mock).mockResolvedValueOnce(journalMock);
      (AccessServices.updatePassword as jest.Mock).mockResolvedValueOnce(undefined);
  
      await AccessController.updateAccount(req, res, next);
  
      expect(AccessServices.updatePassword).toHaveBeenCalledWith('testUserId', 'oldPass', 'newPass');
      expect(req.flash).toHaveBeenCalledWith('success', 'Password updated successfully.');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ flash: { 
        info: ['Please log in again with your new credentials.'], 
        success: ['Password updated successfully.'] } });
    });

    it('should call next with an error if updatePassword throws an error', async () => {
      req.params.journalId = 'testJournalId';
      req.body.password = { oldPassword: 'oldPass', newPassword: 'newPass' };
  
      const journalMock = { _id: 'testJournalId', user: 'testUserId' };
      (Models.Journal.findById as jest.Mock).mockResolvedValueOnce(journalMock);
      (AccessServices.updatePassword as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
  
      await AccessController.updateAccount(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should update the config successfully', async () => {
      req.params.journalId = 'testJournalId';
      req.body.config = { model: { chat: 'testChatModel', analysis: 'testAnalysisModel' } };
  
      const journalMock = { _id: 'testJournalId', user: 'testUserId', config: 'configId' };
      (Models.Journal.findById as jest.Mock).mockResolvedValueOnce(journalMock);
      (AccessServices.updateConfig as jest.Mock).mockResolvedValueOnce(undefined);
  
      await AccessController.updateAccount(req, res, next);
  
      expect(AccessServices.updateConfig).toHaveBeenCalledWith('configId', journalMock, {  model: { chat: 'testChatModel', analysis: 'testAnalysisModel' } });
      expect(req.flash).toHaveBeenCalledWith('success', 'Config updated successfully.');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ flash: { success: ['Config updated successfully.'] } });
    });

    it('should update the profile successfully', async () => {
      req.params.journalId = 'testJournalId';
      req.body.profile = { fname: 'New', lname: 'Name' };
  
      const journalMock = { _id: 'testJournalId', user: 'testUserId' };
      (Models.Journal.findById as jest.Mock).mockResolvedValueOnce(journalMock);
      (AccessServices.updateProfile as jest.Mock).mockResolvedValueOnce({
        user: { _id: 'testUserId' },
        errorMessage: undefined,
      });
  
      await AccessController.updateAccount(req, res, next);
  
      expect(Models.Journal.findById).toHaveBeenCalledWith('testJournalId');
      expect(AccessServices.updateProfile).toHaveBeenCalledWith('testUserId', { fname: 'New', lname: 'Name' });
      expect(req.flash).toHaveBeenCalledWith('success', 'Profile updated successfully.');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ flash: { success: ['Profile updated successfully.'] } });
    });

    it('should handle an error when updating the profile fails', async () => {
      req.params.journalId = 'testJournalId';
      req.body.profile = { fname: 'Test', lname: 'User' };
  
      const journalMock = { _id: 'testJournalId', user: 'testUserId' };
      (Models.Journal.findById as jest.Mock).mockResolvedValueOnce(journalMock);
      (AccessServices.updateProfile as jest.Mock).mockResolvedValueOnce({
        user: 'testUserId',
        errorMessage: 'Invalid email address.',
      });
  
      await AccessController.updateAccount(req, res, next);
  
      expect(req.flash).toHaveBeenCalledWith('warning', 'The email address provided cannot be used.');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ flash: { 
        success: ['Profile updated successfully.'],
        warning: ['The email address provided cannot be used.'] } });
    });
  
    it('should call next with an ExpressError if journal is not found', async () => {
      req.params.journalId = 'nonexistentJournalId';
      req.body.profile = { fname: 'Test', lname: 'User' };
  
      (Models.Journal.findById as jest.Mock).mockResolvedValueOnce(null);
  
      await AccessController.updateAccount(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });

    it('should call next with an ExpressError if an user is not found', async () => {
      req.params.journalId = 'testJournalId';
      req.body.profile = { fname: 'Test', lname: 'User' };
  
      const journalMock = { _id: 'testJournalId', user: 'testUserId' };
      (Models.Journal.findById as jest.Mock).mockResolvedValueOnce(journalMock);
      (AccessServices.updateProfile as jest.Mock).mockResolvedValueOnce({
        user: null,
        errorMessage: undefined,
      });

      await AccessController.updateAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });
  
    it('should handle unexpected errors gracefully', async () => {
      req.params.journalId = 'testJournalId';
      req.body.profile = { fname: 'Test', lname: 'User' };
  
      const unexpectedError = new Error('Unexpected error');
      (Models.Journal.findById as jest.Mock).mockRejectedValueOnce(unexpectedError);
  
      await AccessController.updateAccount(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });
  });

  describe('deleteItem', () => {
    it('should return a success flash message if the config is deleted', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
      req.query.deletionItem = 'config';
    
      const res = mockRes();
      const next = mockNext();
    
      (AccessServices.deleteConfig as jest.Mock).mockResolvedValue(true);
    
      await AccessController.deleteItem(req, res, next);
    
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ flash: { success: ['Config deleted successfully.'] } });
    });

    it('should call next if an error if thrown by deleteConfig', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
      req.query.deletionItem = 'config';
    
      const res = mockRes();
      const next = mockNext();
    
      (AccessServices.deleteConfig as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
    
      await AccessController.deleteItem(req, res, next);
    
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should return a success flash message if the account is deleted', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
      req.query.deletionItem = 'account';
    
      const res = mockRes();
      const next = mockNext();
    
      (AccessServices.deleteAccount as jest.Mock).mockResolvedValue(true);
    
      await AccessController.deleteItem(req, res, next);
    
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ flash: { success: ['Account deleted successfully.'] } });
    });

    it('should call next with an ExpressError defined by deleteAccount', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
      req.query.deletionItem = 'account';
    
      const res = mockRes();
      const next = mockNext();
    
      (AccessServices.deleteAccount as jest.Mock).mockRejectedValueOnce(new ExpressError('Test error', 400));
    
      await AccessController.deleteItem(req, res, next);
    
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });

    it('should call next with an error defined in deleteItem if a non-ExpressError is thrown', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
      req.query.deletionItem = 'account';
    
      const res = mockRes();
      const next = mockNext();
    
      (AccessServices.deleteAccount as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
    
      await AccessController.deleteItem(req, res, next);
    
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });

    it('should call next with an ExpressError if an invalid deletionItem is provided', async () => {
      const req = mockReq();
      req.params.journalId = 'testJournalId';
      req.query.deletionItem = 'invalidItem';
    
      const res = mockRes();
      const next = mockNext();
    
      await AccessController.deleteItem(req, res, next);
    
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });
  });

  describe('login', () => {
    const ORIGINAL_RELEASE_PHASE = process.env.RELEASE_PHASE;

    beforeAll(() => {
      process.env.RELEASE_PHASE = '';
    });

    afterAll(() => {
      process.env.RELEASE_PHASE = ORIGINAL_RELEASE_PHASE;
    });

    it('should return a success flash message if the user is logged in', async () => {
      const req = mockReq();
      req.body = { email: 'test@test.com' };
      
      const res = mockRes();
      const next = mockNext();

      (AccessServices.ensureJournalExists as jest.Mock).mockResolvedValueOnce({
        id: 'testJournalId',
        title: 'testJournalTitle',
      });

      await AccessController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        journalId: 'testJournalId',
        journalTitle: 'testJournalTitle',
        flash: {
          success: ['Welcome back, Test. You\'ve been logged in successfully.'],
        },
        token: undefined,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return a success flash message if the user is logged in and remember is true', async () => {
      const req = mockReq();
      req.body = { email: 'test@test.com', remember: true };

      const res = mockRes();
      const next = mockNext();

      (AccessServices.ensureJournalExists as jest.Mock).mockResolvedValueOnce({
        id: 'testJournalId',
        title: 'testJournalTitle',
      });

      await AccessController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        journalId: 'testJournalId',
        journalTitle: 'testJournalTitle',
        flash: {
          info: ['You will be logged out after 7 days.'],
          success: ['Welcome back, Test. You\'ve been logged in successfully.'],
        },
        token: expect.any(String),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return an error if JWT_SECRET is not set and remember is true', async () => {
      const ORIGINAL_JWT_SECRET = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const req = mockReq();
      req.body = { email: 'test@test.com', remember: true };

      const res = mockRes();
      const next = mockNext();

      (AccessServices.ensureJournalExists as jest.Mock).mockResolvedValueOnce({
        id: 'testJournalId',
        title: 'testJournalTitle',
      });

      await AccessController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 'flash': {
        'error': [
          'JWT secret not defined',
        ],
        'success': [
          'Welcome back, Test. You\'ve been logged in successfully.',
        ],
      },
      'journalId': 'testJournalId',
      'journalTitle': 'testJournalTitle',
      'token': undefined, });
      expect(next).not.toHaveBeenCalled();

      process.env.JWT_SECRET = ORIGINAL_JWT_SECRET;
    });
  
    it('should call next if passport.authenticate returns an error', async () => {
      (passport.authenticate as jest.Mock).mockImplementationOnce(
        (strategy, callback) =>
          (req: Request, res: Response, next: never) => {
            callback(new Error('Passport error'), null, null);
          }
      );
  
      const req = mockReq();
      req.body = { email: 'error@test.com' };

      const res = mockRes();
      const next = mockNext();
  
      await AccessController.login(req, res, next);
  
      // We expect next to have been called with the passport error
      expect(next).toHaveBeenCalledWith(new Error('Passport error'));
    });
  
    it('should handle failed login if user is null but user is found in DB', async () => {
      (passport.authenticate as jest.Mock).mockImplementationOnce(
        (strategy, callback) =>
          (req: Request, res: Response, next: never) => {
            callback(null, null, 'Some error message');
          }
      );

      // DB user found
      (Models.User.findOne as jest.Mock).mockResolvedValueOnce({ betaAccess: false });
  
      const req = mockReq();
      req.body = { email: 'test@test.com' };

      const res = mockRes();
      const next = mockNext();
  
      await AccessController.login(req, res, next);
  
      // The 403 status from handleFailedLogin
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        flash: expect.any(Object),
      });
      expect(next).not.toHaveBeenCalled();
    });
  
    it('should call next if req.logIn fails', async () => {
      // Keep passport returning a valid user
      (passport.authenticate as jest.Mock).mockImplementationOnce(
        (strategy, callback) =>
          (req: Request, res: Response, next: never) => {
            callback(null, { id: 'testUserId', fname: 'Test' }, null);
          }
      );
  
      // Force req.logIn to fail
      const req = mockReq();
      req.logIn = jest.fn((user, cb) => cb(new Error('logIn failed'))) as never;
  
      req.body = { email: 'fail@login.com' };
      const res = mockRes();
      const next = mockNext();
  
      await AccessController.login(req, res, next);
  
      // Should pass the error to next
      expect(next).toHaveBeenCalledWith(new Error('logIn failed'));
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next if user does not exist or password is incorrect', async () => {
      // Could not authenticate the user with the given email and password
      (passport.authenticate as jest.Mock).mockImplementationOnce(
        (strategy, callback) =>
          (req: Request, res: Response, next: never) => {
            callback(null, null, 'Some error message');
          }
      );

      // Suspicious login attempt not detected
      (Models.User.findOne as jest.Mock).mockResolvedValueOnce(null);
  
      const req = mockReq();
      req.body = { email: 'invalid-login@test.com' };

      const res = mockRes();
      const next = mockNext();

      await AccessController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('tokenLogin', () => {
    const ORIGINAL_RELEASE_PHASE = process.env.RELEASE_PHASE;

    beforeAll(() => {
      process.env.RELEASE_PHASE = '';
    });
  
    afterAll(() => {
      process.env.RELEASE_PHASE = ORIGINAL_RELEASE_PHASE;
    });
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should call next with a 403 error if token is invalid or has expired', async () => {
      const req = mockReq();
      req.token = undefined;

      const res = mockRes();
      const next = mockNext();
  
      // No token on req => triggers the 403 path
      await AccessController.tokenLogin(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
      expect(res.status).not.toHaveBeenCalled();
    });
  
    it('should call next with a 404 error if journal is not found', async () => {
      const req = mockReq();
      req.token = 'testTokenId';

      const res = mockRes();
      const next = mockNext();
  
      (AccessServices.getPopulatedJournal as jest.Mock).mockResolvedValueOnce(null);
  
      await AccessController.tokenLogin(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    });
  
    it('should call next with an error if req.logIn fails', async () => {
      const req = mockReq();
      req.token = 'testTokenId';

      const res = mockRes();
      const next = mockNext();
  
      (AccessServices.getPopulatedJournal as jest.Mock).mockResolvedValueOnce({
        _id: 'testJournalId',
        title: 'testJournalTitle',
      });
  
      // Force req.logIn to fail
      req.logIn = jest.fn((user, cb) => cb(new Error('logIn failed'))) as never;
  
      await AccessController.tokenLogin(req, res, next);
  
      expect(next).toHaveBeenCalledWith(new Error('logIn failed'));
      expect(res.status).not.toHaveBeenCalled();
    });
  
    it('should flash info if token is within 12 hours old', async () => {
      // `iat` is 1 hour ago => within 12 hours
      const req = mockReq();
      req.token = { id: 'testUserId', iat: Math.floor(Date.now() / 1000) - 3600 };

      const res = mockRes();
      const next = mockNext();
  
      const userMock = { fname: 'Test' };
      (AccessServices.getPopulatedJournal as jest.Mock).mockResolvedValueOnce({
        _id: 'testJournalId',
        title: 'testJournalTitle',
        user: userMock,
      });
  
      await AccessController.tokenLogin(req, res, next);
  
      expect(req.flash).toHaveBeenCalledWith('info', 'Logging out will prevent automatic future logins.');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        journalId: 'testJournalId',
        journalTitle: 'testJournalTitle',
        flash: {
          success: ['Welcome back, Test. You\'ve been automatically logged in successfully.'],
          info: ['Logging out will prevent automatic future logins.'],
        },
      });
      expect(next).not.toHaveBeenCalled();
    });
  
    it('should not return info flash if token is older than 12 hours', async () => {
      // `iat` is 24 hours ago => outside 12 hour window
      const req = mockReq();
      req.token = { id: 'testUserId', iat: Math.floor(Date.now() / 1000) - 86400 };

      const res = mockRes();
      const next = mockNext();
  
      const userMock = { fname: 'Test' };
      (AccessServices.getPopulatedJournal as jest.Mock).mockResolvedValueOnce({
        _id: 'testJournalId',
        title: 'testJournalTitle',
        user: userMock,
      });
  
      await AccessController.tokenLogin(req, res, next);
  
      expect(req.flash).toHaveBeenCalledWith(
        'success',
        'Welcome back, Test. You\'ve been automatically logged in successfully.'
      );
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        journalId: 'testJournalId',
        journalTitle: 'testJournalTitle',
        flash: {
          success: ['Welcome back, Test. You\'ve been automatically logged in successfully.'],
        },
      });
      expect(next).not.toHaveBeenCalled();
    });
  
    it('should return 200 if token is valid and login is successful', async () => {  
      const req = mockReq();
      req.token = { id: 'testUserId', iat: Math.floor(Date.now() / 1000) - 3600 };

      const res = mockRes();
      const next = mockNext();
  
      const userMock = { fname: 'Test', betaAccess: false, save: jest.fn() };
      (AccessServices.getPopulatedJournal as jest.Mock).mockResolvedValueOnce({
        _id: 'testJournalId',
        title: 'testJournalTitle',
        user: userMock,
      });
  
      await AccessController.tokenLogin(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        journalId: 'testJournalId',
        journalTitle: 'testJournalTitle',
        flash: {
          info: ['Logging out will prevent automatic future logins.'],
          success: ['Welcome back, Test. You\'ve been automatically logged in successfully.'],
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with an error if an unexpected error occurs', async () => {
      const req = mockReq();
      req.token = { id: 'testUserId', iat: Math.floor(Date.now() / 1000) - 3600 };

      const res = mockRes();
      const next = mockNext();
  
      (AccessServices.getPopulatedJournal as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
  
      await AccessController.tokenLogin(req, res, next);
  
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});