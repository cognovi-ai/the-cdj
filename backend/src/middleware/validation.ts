import {
  Entry,
  EntryAnalysis,
  EntryConversation,
  Journal,
  User,
} from '../models/index.js';
import { NextFunction, Request, Response } from 'express';
import ExpressError from '../utils/ExpressError.js';
import Joi from 'joi';

/**
 * Throw Joi validation error.
 * 
 * @param error Joi.ValidationError
 * @throws ExpressError
 */
function throwValidationError(error: Joi.ValidationError) {
  const msg = error.details.map((el) => el.message).join(' ');
  throw new ExpressError(msg, 400);
}

/**
 * Validate the request body for login data.
 */
export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = User.baseJoi(req.body, {
    allowUnknown: true,
    stripUnknown: true,
    abortEarly: true,
  });

  if (error) throwValidationError(error);

  req.body = value;
  return next();
};

/**
 * Validate new password.
 */
export const validateNewPassword = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = User.passwordJoi(req.body, {
    allowUnknown: true,
    stripUnknown: true,
    abortEarly: false,
  });

  if (error) throwValidationError(error);

  return next();
};

/**
 * Validate the request body for registration data.
 */
export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = User.registrationJoi(req.body, {
    allowUnknown: true,
    stripUnknown: true,
    abortEarly: true,
  });

  if (error) throwValidationError(error);

  req.body = value;
  return next();
};

/**
 * Validate the request body for account data.
 */
export const validateAccount = (req: Request, res: Response, next: NextFunction): void => {
  const { profile, password } = req.body;

  const { error } = User.accountJoi(
    { ...profile, ...password },
    {
      abortEarly: false,
    }
  );

  if (error) throwValidationError(error);
    
  return next();
};

/**
 * Validate the request body for a journal.
 */
export const validateJournal = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = Journal.joi(req.body, {
    allowUnknown: true,
  });

  if (error) throwValidationError(error);

  req.body = value;
  return next();
};

/**
 * Validate the request body for an entry.
 */
export const validateEntry = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = Entry.joi(req.body);

  if (error) throwValidationError(error);

  req.body = value;
  return next();
};

/**
 * Validate the request body for an entry analysis.
 */
export const validateEntryAnalysis = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = EntryAnalysis.joi(req.body, {
    allowUnknown: true,
  });

  if (error) throwValidationError(error);

  req.body = value;
  return next();
};

/**
 * Validate the request body for an entry conversation.
 */
export const validateEntryConversation = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = EntryConversation.joi(req.body);

  if (error) throwValidationError(error);

  req.body = value;
  return next();
};
