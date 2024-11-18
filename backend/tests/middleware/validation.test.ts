/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Entry, EntryAnalysis, EntryConversation, Journal, User } from '../../src/models/index.js';
import { NextFunction, Request, Response } from 'express';
import { validateAccount, validateEntry, validateEntryAnalysis, validateEntryConversation, validateJournal, validateLogin, validateNewPassword, validateRegistration } from '../../src/middleware/validation.js';
import ExpressError from '../../src/utils/ExpressError.js';

jest.mock('../../src/utils/ExpressError.js');
jest.mock('../../src/models/index.js', () => {
  return {
    User: {
      baseJoi: jest.fn().mockReturnValue({ error: null, value: {} }),
      passwordJoi: jest.fn().mockReturnValue({ error: null }),
      registrationJoi: jest.fn().mockReturnValue({ error: null, value: {} }),
      accountJoi: jest.fn().mockReturnValue({ error: null }),
    },
    Journal: {
      joi: jest.fn().mockReturnValue({ error: null, value: {} }),
    },
    Entry: {
      joi: jest.fn().mockReturnValue({ error: null, value: {} }),
    },
    EntryAnalysis: {
      joi: jest.fn().mockReturnValue({ error: null, value: {} }),
    },
    EntryConversation: {
      joi: jest.fn().mockReturnValue({ error: null, value: {} }),
    },
  };
});

describe('Validation Middleware Tests', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  const mockValidation = (Model: any, method: string, error = null, value = {}) => {
    Model[method].mockReturnValueOnce({ error, value });
  };

  const createMockError: any = (message: string) => {
    return {
      details: [
        {
          message,
          path: ['mockPath'],
          type: 'any.base',
          context: {
            label: 'mockLabel',
            value: 'mockValue',
            key: 'mockKey',
          },
        },
      ],
    };
  };

  beforeEach(() => {
    req = { body: {} } as Request;
    res = {} as Response;
    next = jest.fn();
  });

  it('should call next() if login validation succeeds', () => {
    mockValidation(User, 'baseJoi', null, { email: 'test@example.com' });
    validateLogin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ email: 'test@example.com' });
  });

  it('should throw ExpressError if login validation fails', () => {
    const mockError = createMockError('Invalid email');
    mockValidation(User, 'baseJoi', mockError);

    expect(() => validateLogin(req, res, next)).toThrow(ExpressError);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if new password validation succeeds', () => {
    mockValidation(User, 'passwordJoi');
    validateNewPassword(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should throw ExpressError if new password validation fails', () => {
    const mockError = createMockError('Invalid password');
    mockValidation(User, 'passwordJoi', mockError);

    expect(() => validateNewPassword(req, res, next)).toThrow(ExpressError);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if registration validation succeeds', () => {
    mockValidation(User, 'registrationJoi', null, { username: 'testUser' });
    validateRegistration(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ username: 'testUser' });
  });

  it('should throw ExpressError if registration validation fails', () => {
    const mockError = createMockError('Invalid registration data');
    mockValidation(User, 'registrationJoi', mockError);

    expect(() => validateRegistration(req, res, next)).toThrow(ExpressError);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if account validation succeeds', () => {
    req.body = { profile: {}, password: {}, config: {} };
    mockValidation(User, 'accountJoi');
    validateAccount(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should throw ExpressError if account validation fails', () => {
    const mockError = createMockError('Invalid account data');
    mockValidation(User, 'accountJoi', mockError);

    expect(() => validateAccount(req, res, next)).toThrow(ExpressError);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if journal validation succeeds', () => {
    mockValidation(Journal, 'joi', null, { title: 'Test Journal' });
    validateJournal(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ title: 'Test Journal' });
  });

  it('should throw ExpressError if journal validation fails', () => {
    const mockError = createMockError('Invalid journal data');
    mockValidation(Journal, 'joi', mockError);

    expect(() => validateJournal(req, res, next)).toThrow(ExpressError);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if entry validation succeeds', () => {
    mockValidation(Entry, 'joi', null, { entryText: 'Test Entry' });
    validateEntry(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ entryText: 'Test Entry' });
  });

  it('should throw ExpressError if entry validation fails', () => {
    const mockError = createMockError('Invalid entry data');
    mockValidation(Entry, 'joi', mockError);

    expect(() => validateEntry(req, res, next)).toThrow(ExpressError);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if entry analysis validation succeeds', () => {
    mockValidation(EntryAnalysis, 'joi', null, { analysis: 'Test Analysis' });
    validateEntryAnalysis(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ analysis: 'Test Analysis' });
  });

  it('should throw ExpressError if entry analysis validation fails', () => {
    const mockError = createMockError('Invalid entry analysis data');
    mockValidation(EntryAnalysis, 'joi', mockError);

    expect(() => validateEntryAnalysis(req, res, next)).toThrow(ExpressError);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if entry conversation validation succeeds', () => {
    mockValidation(EntryConversation, 'joi', null, { conversation: 'Test Conversation' });
    validateEntryConversation(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ conversation: 'Test Conversation' });
  });

  it('should throw ExpressError if entry conversation validation fails', () => {
    const mockError = createMockError('Invalid entry conversation data');
    mockValidation(EntryConversation, 'joi', mockError);

    expect(() => validateEntryConversation(req, res, next)).toThrow(ExpressError);
    expect(next).not.toHaveBeenCalled();
  });
});