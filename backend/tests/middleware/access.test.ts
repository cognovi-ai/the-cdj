/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import User, { UserType } from '../../src/models/user.js';
import { isAuthenticated, isLoggedIn, requestBetaAccess } from '../../src/middleware/access.js';
import ExpressError from '../../src/utils/ExpressError.js';
import jwt from 'jsonwebtoken';

// Mock external dependencies
jest.mock('jsonwebtoken');
jest.mock('../../src/models/user.js');

describe('Middleware Tests', () => {
  describe('isAuthenticated', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {};
      res = {};
      next = jest.fn();
    });

    it('should call next if req.isAuthenticated() returns true', () => {
      req.isAuthenticated = jest.fn().mockReturnValue(true) as any;

      isAuthenticated(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should call next with error if req.isAuthenticated() returns false', () => {
      req.isAuthenticated = jest.fn().mockReturnValue(false) as any;

      isAuthenticated(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        new ExpressError('You must be logged in to access this page.', 401)
      );
    });

    it('should call next with error if req.isAuthenticated is undefined', () => {
      req.isAuthenticated = undefined;

      isAuthenticated(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        new ExpressError('You must be logged in to access this page.', 401)
      );
    });
  });

  describe('isLoggedIn', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {};
      res = {};
      next = jest.fn();
      process.env.JWT_SECRET = 'testsecret';
    });

    it('should call next and set req.token if token is valid', () => {
      const decodedToken = { id: 'userId' };
      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(null, decodedToken);
      });
      if (!req.headers) req.headers = {};
      req.headers.authorization = 'Bearer validtoken';
  
      isLoggedIn(req as Request, res as Response, next);
  
      expect(jwt.verify).toHaveBeenCalledWith(
        'validtoken',
        'testsecret',
        expect.any(Function)
      );
      expect(req.token).toEqual(decodedToken);
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next with error if token is invalid', () => {
      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), undefined);
      });
      if (!req.headers) req.headers = {};
      req.headers.authorization = 'Bearer invalidtoken';

      isLoggedIn(req as Request, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith(
        'invalidtoken',
        'testsecret',
        expect.any(Function)
      );
      expect(next).toHaveBeenCalledWith(
        new ExpressError(
          'You are trying to access a protected route with an invalid token.',
          401
        )
      );
    });

    it('should call next if no token is provided', () => {
      isLoggedIn(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('requestBetaAccess', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let mockUser: Partial<UserType>;

    beforeEach(() => {
      req = {
        body: {
          fname: 'John',
          lname: 'Doe',
          email: 'john.doe@example.com',
        },
        flash: jest.fn(),
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
      process.env.RELEASE_PHASE = 'beta';

      mockUser = {
        email: 'john.doe@example.com',
        fname: 'John',
        lname: 'Doe',
        betaAccess: undefined,
        betaAccessTokenExpires: undefined,
        emailVerified: false,
        save: jest.fn(),
        sendBetaAccessVerificationEmail: jest.fn(),
        generateEmailVerificationToken: jest.fn().mockReturnValue('token'),
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User as unknown as jest.Mock).mockImplementation(() => mockUser);
    });

    it('should call next if RELEASE_PHASE is not beta', async () => {
      process.env.RELEASE_PHASE = 'production';

      await requestBetaAccess(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should create new user and send verification email when user does not exist', async () => {
      await requestBetaAccess(req as Request, res as Response, next);
      if (!req.flash) req.flash = jest.fn();
      
      expect(User.findOne).toHaveBeenCalledWith({ email: 'john.doe@example.com' });
      expect(mockUser.sendBetaAccessVerificationEmail).toHaveBeenCalledWith('token');
      expect(mockUser.save).toHaveBeenCalled();
      expect(req.flash).toHaveBeenCalledWith(
        'info',
        expect.stringContaining('by signing up you have requested beta access')
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ flash: req.flash() });
    });

    it('should return error if user email is not verified', async () => {
      mockUser.emailVerified = false;
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await requestBetaAccess(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        new ExpressError(
          'You must verify your email address in order for your beta request to be reviewed.',
          403
        )
      );
    });

    it('should return error if beta access is pending approval', async () => {
      mockUser.emailVerified = true;
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await requestBetaAccess(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        new ExpressError('Beta access is pending approval.', 403)
      );
    });

    it('should proceed to next middleware if user has beta access', async () => {
      mockUser.betaAccess = true;
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await requestBetaAccess(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error if beta access has been denied and token has not expired', async () => {
      mockUser.betaAccess = false;
      mockUser.betaAccessTokenExpires = new Date(Date.now() + 10000);
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    
      await requestBetaAccess(req as Request, res as Response, next);
    
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Beta access has been denied'),
          statusCode: 403,
        })
      );
    });

    it('should handle exceptions and return server error', async () => {
      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await requestBetaAccess(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        new ExpressError(
          'An error occurred while attempting to request beta access.',
          500
        )
      );
    });
  });
});