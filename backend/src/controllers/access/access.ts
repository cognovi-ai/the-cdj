import * as AccessServices from '../../models/services/access/access.js';
import { Journal, User } from '../../models/index.js';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ConfigType } from '../../models/config.js';
import ExpressError from '../../utils/ExpressError.js';
import { UserType } from '../../models/user.js';
import crypto from 'crypto';
import passport from 'passport';

/**
 * Used for JWT login, where token payload is User.id
 */
interface TokenRequest extends Request {
  token: UserToken;
}

/**
 * JWT with added payload fields. User.id used for JWT login
 */
interface UserToken extends JwtPayload {
  id: string;
}

/**
 * Expected request body for PUT requests to the account endpoint.
 */
interface UpdateAccountRequestBody {
  profile?: {
    fname?: string;
    lname?: string;
    email?: string;
  };
  password?: {
    oldPassword: string;
    newPassword: string;
  };
  config?: ConfigType;
}

/**
 * Handle behavior and HTTP response after authentication fails.
 * 
 * If user has been denied beta access, a 403 HTTP error is returned.
 * If user does not have beta access and has not verified their email, a token is generated
 * and an email is sent to verify their email, then a 403 HTTP error is returned.
 * Otherwise, a 403 HTTP error is returned.
 */
async function handleFailedLogin (req: Request, res: Response, next: NextFunction, user: UserType, errorMessage: string) {
  if (user.betaAccess === false) {
    req.flash('warning', `You do not have ${process.env.RELEASE_PHASE} access.`);
    return res.status(403).json({ flash: req.flash() });
  }

  if (user.betaAccess === undefined) {
    if (!user.emailVerified) {
      user.sendBetaAccessVerificationEmail(user.generateEmailVerificationToken());
      await user.save();

      req.flash(
        'info',
        'You must verify your email address to have your beta request reviewed. Please check your mailbox for messages from The CDJ Team.'
      );
    } else {
      req.flash(
        'info',
        'Your request for beta access is pending approval. We will notify you via email upon approval. Please check your mailbox for messages from The CDJ Team.'
      );
    }
    return res.status(403).json({ flash: req.flash() });
  }

  return next(new ExpressError(errorMessage, 403));
}

/**
 * Generates a JWT for persistent login.
 */
function generateToken (userId: string): string {
  const { JWT_SECRET } = process.env;
  if (!JWT_SECRET) {
    throw new Error('JWT secret not defined');
  }
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Show info message only for the first 12 hours based on `iat` timestamp.
 * 
 * @param token JWT
 * @returns true if current time within 12 hours of token.iat, false otherwise
 */
function isWithinTwelveHours(token: UserToken) {
  const currentTime = Math.floor(Date.now() / 1000);
  const TWELVE_HOURS = 43200; // 12 hours in seconds
  token.iat = token.iat ?? currentTime - 30; // Backdate JWT by 30 seconds if undefined
  return token.iat + TWELVE_HOURS > currentTime;
}

/**
 * Update the journal by accepted fields.
 */
export const updateJournal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { journalId } = req.params;
  const { title } = req.body;

  try {
    const updatedJournal = await AccessServices.updateJournalTitle(journalId, title);

    if (updatedJournal) {
      req.flash('success', 'Journal title updated successfully.');
    } else {
      req.flash('warning', 'Journal title not updated.');
    }
    

    res.status(200).json({ flash: req.flash() });
  } catch(err) {
    if (!(err instanceof ExpressError)) {
      return next(new ExpressError((err as Error).message, 404));
    }
    return next(
      new ExpressError(
        'An error occurred while attempting to update the journal.',
        500
      )
    );
  }
};

/**
 * Get the user associated with a journal.
 */
export const getAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { journalId } = req.params;

  try {
    const {
      configMessage,
      user,
      config
    } = await AccessServices.getAccount(journalId);

    // If the config doesn't exist instruct the user to set it up
    if (configMessage) {
      req.flash('info', configMessage);
    }
    res.status(200).json({ user, config, flash: req.flash() });
  } catch (err) {
    return next(new ExpressError((err as Error).message, 404));
  }
};

/**
 * Update the User and Config models by journalId.
 */
export const updateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { journalId } = req.params;
  const { profile, password, config } = req.body as UpdateAccountRequestBody;

  try {
    const journal = await Journal.findById(journalId);
    if (!journal) return next(new ExpressError('Journal not found.', 404));

    // Update the User model with the profile data
    if (profile) {
      const { user, errorMessage } = await AccessServices.updateProfile(journal.user.toString(), profile);
      if (errorMessage) req.flash('warning', 'The email address provided cannot be used.');
      if (!user) return next(new ExpressError('User not found.', 404));
      req.flash('success', 'Profile updated successfully.');
    }
    
    // Update the user's password
    if (password) {
      const { oldPassword, newPassword } = password;
      try {
        await AccessServices.updatePassword(journal.user.toString(), oldPassword, newPassword);
      } catch (error) {
        return next(error);
      }
      req.flash('success', 'Password updated successfully.');
    }

    // Update the Config model with the config data
    if (config) {
      await AccessServices.updateConfig(journal.config?.toString(), journal, config);
      req.flash('success', 'Config updated successfully.');
    }

    // If the email was updated, re-authenticate the user
    if (profile?.email || password) {
      req.flash('info', 'Please log in again with your new credentials.');
    }

    res.status(200).json({ flash: req.flash() });
  } catch {
    return next(
      new ExpressError(
        'An error occurred while attempting to update the account.',
        500
      )
    );
  }
};

/**
 * Delete an item from the account endpoint of a journal.
 */
export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  const { journalId } = req.params;
  const { deletionItem } = req.query;

  if (deletionItem === 'config') {
    try {
      await AccessServices.deleteConfig(journalId);
      req.flash('success', 'Config deleted successfully.');
      res.status(200).json({ flash: req.flash() });
    } catch (err) {
      return next(err);
    }
  } else if (deletionItem === 'account') {
    try {
      await AccessServices.deleteAccount(journalId);
      req.flash('success', 'Account deleted successfully.');
      res.status(200).json({ flash: req.flash() });      
    } catch (err) {
      if (err instanceof ExpressError) {
        return next(err);
      }
      return next(
        new ExpressError(
          'An error occurred while attempting to delete the account.',
          500
        )
      );
    }
  } else {
    return next(new ExpressError('Invalid deletion item.', 400));
  }
};

/**
 * Login a user.
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', async (err: Error, user: UserType | null, errorMessage: string) => {
    if (err) {
      return next(err);
    }

    // Handle unsuccessful authentication attempt
    if (!user) {
      const { email } = req.body;
      const susUser = await User.findOne({ email });

      if (susUser) {
        return handleFailedLogin(req, res, next, susUser, errorMessage);
      } else {
        return next(new ExpressError('Email or password is incorrect.', 401));
      }
    }

    // Generate a token if the user wants to be remembered
    let token: string;
    if (req.body.remember) {
      try {
        token = generateToken(user.id);
      } catch (err) {
        req.flash('error', (err as Error).message);
      }
    }

    // Initiate login session for user
    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }

      // Give existing users beta access
      if (process.env.RELEASE_PHASE === 'beta' && !user.betaAccess) {
        user.betaAccess = true;
        await user.save();

        req.flash('info', 'You have been granted beta access.');
      }

      // Retrieve the user's journal
      const journal = await AccessServices.ensureJournalExists(user.id);

      if (token) req.flash('info', 'You will be logged out after 7 days.');

      req.flash(
        'success',
        `Welcome back, ${user.fname}. You've been logged in successfully.`
      );

      res.status(200).json({
        journalId: journal.id,
        journalTitle: journal.title,
        flash: req.flash(),
        token,
      });
    });
  })(req, res, next);
};

/**
 * Login a user with a token.
 */
export const tokenLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req as TokenRequest;
    if (!token) {
      return next(new ExpressError('Token is invalid or has expired.', 403));
    }

    const journal = await AccessServices.getPopulatedJournal(token.id);
    if (!journal) {
      return next(new ExpressError('Journal not found.', 404));
    }

    req.logIn(journal.user, async (err) => {
      if (err) {
        return next(err);
      }

      // Grant beta access if applicable
      if (process.env.RELEASE_PHASE === 'beta' && !journal.user.betaAccess) {
        journal.user.betaAccess = true;
        await journal.user.save();

        req.flash('info', 'You have been granted beta access.');
      }

      const withinTwelveHours = isWithinTwelveHours(token);
      if (withinTwelveHours) {
        req.flash('info', 'Logging out will prevent automatic future logins.');
      }

      req.flash(
        'success',
        `Welcome back, ${journal.user.fname}. You've been automatically logged in successfully.`
      );

      return res.status(200).json({
        journalId: journal._id,
        journalTitle: journal.title,
        flash: req.flash(),
      });
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Forgot password.
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  try {
    await AccessServices.forgotPassword(email);

    req.flash('success', 'Recovery email sent successfully.');
    res.status(200).json({ flash: req.flash() });
  } catch (err) {
    return next(err);
  }
};

/**
 * Reset password.
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { newPassword, token } = req.body;

  try {
    await AccessServices.resetPassword(token, newPassword);

    req.flash('success', 'Password reset successfully.');
    res.status(200).json({ flash: req.flash() });
  } catch (err) {
    if (err instanceof ExpressError) {
      return next(err);
    }
    return next(
      new ExpressError(
        'An error occurred while attempting to reset the password.',
        500
      )
    );
  }
};

/**
 * Logout a user.
 */
export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) return next(err);
  });

  req.flash('success', 'Logged out successfully.');
  res
    .status(200)
    .json({ message: 'Logged out successfully.', flash: req.flash() });
};

/**
 * Register a new user.
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { fname, lname, email, password, title } = req.body;

  try {
    const { newUser, newJournal }= await AccessServices.createAccount(
      fname,
      lname,
      email,
      password,
      title
    );
    req.logIn(newUser, (err) => {
      if (err) return next(err);

      req.flash(
        'success',
        `Welcome, ${fname}. You've been registered successfully.`
      );
      res.status(200).json({
        journalId: newJournal.id,
        journalTitle: newJournal.title,
        flash: req.flash(),
      });
    });
  } catch {
    return next(
      new ExpressError(
        'An error occurred while attempting to register the user.',
        500
      )
    );
  }
};

/**
 * Validate a user's email address.
 */
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.body;

  try {
    const user = await AccessServices.verifyEmail(token);

    if (user.betaAccessToken) {
      req.flash(
        'info',
        'Your request for beta access is pending approval. We will notify you by email as soon as possible when you are approved. Please check your mailbox for messages from The CDJ Team.'
      );
    }
    req.flash('success', 'Email verified successfully.');
    res.status(200).json({ flash: req.flash() });
  } catch (err) {
    if (err instanceof ExpressError) {
      return next(err);
    }
    return next(
      new ExpressError(
        'An error occurred while attempting to verify the email.',
        500
      )
    );
  }
};

/**
 * Approve a user for beta access.
 */
export const betaApproval = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.query;

  if (process.env.RELEASE_PHASE !== 'beta')
    return next(
      new ExpressError('Beta is not the current release phase.', 400)
    );

  if (!token)
    return next(
      new ExpressError('Beta access request token is required.', 400)
    );

  try {
    // Hash the incoming token
    if (typeof token !== 'string') {
      return next(new ExpressError('Missing beta access token', 500));
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Search for user by hashed token
    const user = await User.findOne({
      betaAccessToken: hashedToken,
    });

    if (!user) {
      // No user found
      return next(
        new ExpressError('Beta access request token is invalid.', 400)
      );
    }

    // Approve beta access
    user.betaAccess = true;
    user.betaAccessToken = undefined;
    user.betaAccessTokenExpires = undefined;

    // Send email to user to complete registration
    user.sendBetaApprovalEmail(user.generatePasswordResetToken());

    // Save the updated user
    await user.save();

    req.flash('success', 'Beta access approved successfully.');
    res.status(200).json({ flash: req.flash() });
  } catch {
    // Handle any errors here
    return next(
      new ExpressError(
        'An error occurred while attempting to approve beta access.',
        500
      )
    );
  }
};

/**
 * Deny a user for beta access.
 */
export const betaDenial = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.query;

  if (process.env.RELEASE_PHASE !== 'beta')
    return next(
      new ExpressError('Beta is not the current release phase.', 400)
    );

  if (!token)
    return next(
      new ExpressError('Beta access request token is required.', 400)
    );

  try {
    // Hash the incoming token
    if (typeof token !== 'string') {
      return next(new ExpressError('Missing beta access token', 500));
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Search for user by hashed token
    const user = await User.findOne({
      betaAccessToken: hashedToken,
    });

    if (!user) {
      // No user found
      return next(
        new ExpressError('Beta access request token is invalid.', 400)
      );
    }

    // Deny beta access
    user.betaAccess = false;

    // Send denial email to user
    user.sendBetaDenialEmail();

    // Save the updated user
    await user.save();

    req.flash('success', 'Beta access denied successfully.');
    res.status(200).json({ flash: req.flash() });
  } catch {
    // Handle any errors here
    return next(
      new ExpressError(
        'An error occurred while attempting to deny beta access.',
        500
      )
    );
  }
};