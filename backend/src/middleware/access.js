import ExpressError from '../utils/ExpressError.js';
import User from '../models/user.js';

import jwt from 'jsonwebtoken';

export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // User is authenticated, proceed to the next middleware
  }

  // User is not authenticated, return an error
  return next(
    new ExpressError('You must be logged in to access this page.', 401)
  );
};

export const isLoggedIn = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, token) => {
      if (err) {
        return next(
          new ExpressError(
            'You are trying to access a protected route with an invalid token.',
            401
          )
        );
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
    // Check is user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user
      user = await new User({ email, fname, lname });

      // Undefined betaAccess means the request is pending review
    } else if (
      user.betaAccess === undefined ||
      (user.betaAccess === false && user.betaAccessTokenExpires === undefined)
    ) {
      if (!user.emailVerified) {
        return next(
          new ExpressError(
            'You must verify your email address in order for your beta request to be reviewed.',
            403
          )
        );
      }

      return next(new ExpressError('Beta access is pending approval.', 403));
    } else if (user.betaAccess === true) {
      return next();
    }

    // If denied check the user can reapply after the token expiration date
    if (user.betaAccess === false && user.betaAccessTokenExpires > Date.now()) {
      return next(
        new ExpressError(
          `Beta access has been denied you may apply again after ${user.betaAccessTokenExpires.toLocaleDateString()}.`,
          403
        )
      );
    }

    // Send a confirmation email for the beta request
    await user.sendBetaAccessVerificationEmail(
      user.generateEmailVerificationToken()
    );

    // Save the new user
    await user.save();

    req.flash(
      'info',
      `${fname}, by signing up you have requested beta access. Please look for an email from The CDJ Team to verify your email address. Once verified, your application will be considered. You will then receive a followup email with our decision and instructions to access your account. Thank you for your interest in the app!`
    );
    res.status(200).json({ flash: req.flash() });
  } catch (err) {
    return next(
      new ExpressError(
        'An error occurred while attempting to request beta access.',
        500
      )
    );
  }
};
