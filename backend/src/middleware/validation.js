import { Entry, EntryAnalysis, EntryConversation, Journal, User } from '../models/index.js';
import ExpressError from '../utils/ExpressError.js';

export const validateLogin = (req, res, next) => {
  const { error, value } = User.baseJoi.validate(req.body, {
    allowUnknown: true,
    stripUnknown: true,
    abortEarly: false
  });

  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    req.body = value;
    next();
  }
};

export const validateRegistration = (req, res, next) => {
  const { error, value } = User.registrationJoi.validate(req.body, {
    allowUnknown: true,
    stripUnknown: true,
    abortEarly: false
  });

  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    req.body = value;
    next();
  }
};

export const validateJournal = (req, res, next) => {
  const { error, value } = Journal.joi.validate(req.body, {
    allowUnknown: true
  });

  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    req.body = value;
    next();
  }
};

/**
 * Validate the request body for an entry.
 */
export const validateEntry = (req, res, next) => {
  const { error, value } = Entry.joi.validate(req.body);

  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    req.body = value;
    next();
  }
};

/**
 * Validate the request body for an entry analysis.
 */
export const validateEntryAnalysis = (req, res, next) => {
  const { error, value } = EntryAnalysis.joi.validate(req.body, {
    allowUnknown: true
  });

  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    req.body = value;
    next();
  }
};

/**
 * Validate the request body for an entry conversation.
 */
export const validateEntryConversation = (req, res, next) => {
  const { error, value } = EntryConversation.joi.validate(req.body);

  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    req.body = value;
    next();
  }
};
