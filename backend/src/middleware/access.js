import ExpressError from '../utils/ExpressError.js';
import User from '../models/user.js';

import jwt from 'jsonwebtoken';

export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // User is authenticated, proceed to the next middleware
  }

  // User is not authenticated, return an error
  return next(new ExpressError('You must be logged in to access this page.', 401));
};

export const isLoggedIn = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, token) => {
      if (err) {
        return next(new ExpressError('You are trying to access a protected route with an invalid token.', 401));
      }

      req.token = token;
      return next();
    });
  } else {
    return next();
  }
};

/**
 * Request beta access.
 */
export const requestBetaAccess = async (req, res, next) => {
  if (process.env.RELEASE_PHASE !== 'beta') return next();

  const { fname, lname, email } = req.body;

  try {
    // Create a new user
    const newUser = await new User({ email, fname, lname });

    // Save the new user
    await newUser.save();

    // Send a confirmation email for the beta request
    await newUser.sendBetaRequestConfirmationEmail(newUser.generateEmailVerificationToken());

    req.flash('info', 'A request for beta access has been sent to The CDJ Team. Please check your mailbox to verify your email. Once verified, a followup email will be sent when you are approved with a special link to complete your registration. Thank you for your interest in the app!');
    res.status(200).json({ flash: req.flash() });
  } catch (err) {
    if (err?.code === 11000) {
      return next(new ExpressError('Cannot request beta access at this time.', 400));
    }

    return next(new ExpressError('An error occurred while attempting to request beta access.', 500));
  }
};
