import * as AccountServices from '../../models/services/account.js';
import {
  Config,
  Journal,
  User,
} from '../../models/index.js';
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
 * Request.body for account controller
 */
interface AccountRequestBody {
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
    const updatedJournal = await AccountServices.updateJournal(journalId, title);

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
    } = await AccountServices.getAccount(journalId);

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
  const { profile, password, config } = req.body as AccountRequestBody;

  try {
    const journal = await Journal.findById(journalId);
    if (!journal) return next(new ExpressError('Journal not found.', 404));

    // Update the User model with the profile data
    if (profile) {
      const { user, errorMessage } = await AccountServices.updateProfile(journal.user.toString(), profile);
      if (errorMessage) req.flash('warning', 'The email address provided cannot be used.');
      if (!user) return next(new ExpressError('User not found.', 404));
      req.flash('success', 'Profile updated successfully.');
    }
    
    // Update the user's password
    if (password) {
      const { oldPassword, newPassword } = password;
      try {
        await AccountServices.updatePassword(journal.user.toString(), oldPassword, newPassword);
      } catch (error) {
        return next(error);
      }
      req.flash('success', 'Password updated successfully.');
    }

    // Update the Config model with the config data
    if (config) {
      await AccountServices.updateConfig(journal.config?.toString(), journal, config);
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
      await AccountServices.deleteConfig(journalId);
      req.flash('success', 'Config deleted successfully.');
      res.status(200).json({ flash: req.flash() });
    } catch (err) {
      return next(err);
    }
  } else if (deletionItem === 'account') {
    try {
      await AccountServices.deleteAccount(journalId);
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
  }
};

/**
 * Login a user.
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  type AuthenticateInfo = {
    message: string;
  };
  passport.authenticate('local', async (err: Error, user: UserType | null, info: AuthenticateInfo) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      const { email } = req.body;
      const susUser = await User.findOne({ email });

      if (susUser) {
        // Handle login failure
        if (susUser.betaAccess === false) {
          req.flash(
            'warning',
            `You do not have ${process.env.RELEASE_PHASE} access.`
          );
          return res.status(403).json({ flash: req.flash() });
        } else if (susUser.betaAccess === undefined) {
          if (!susUser.emailVerified) {
            susUser.sendBetaAccessVerificationEmail(
              susUser.generateEmailVerificationToken()
            );

            susUser.save();

            req.flash(
              'info',
              'You must verify your email address in order for your beta request to be reviewed. Please check your mailbox for messages from The CDJ Team.'
            );
          } else {
            req.flash(
              'info',
              'Your request for beta access is pending approval. We will notify you by email as soon as possible when you are approved. Please check your mailbox for messages from The CDJ Team.'
            );
          }
          return res.status(403).json({ flash: req.flash() });
        }

        return next(new ExpressError(info.message, 403));
      } else {
        return next(new ExpressError('Email or password is incorrect.', 401));
      }
    }

    // Generate a token if the user wants to be remembered
    let token: string;
    if (req.body.remember) {
      try {
        const { JWT_SECRET } = process.env;
        if (JWT_SECRET === undefined) {
          throw new Error('JWT secret not defined');
        }
        token = jwt.sign({ id: user._id }, JWT_SECRET, {
          expiresIn: '7d',
        });
      } catch (err) {
        req.flash('error', (err as Error).message);
      }
    }

    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }

      // Give existing users beta access
      if (process.env.RELEASE_PHASE === 'beta' && !user?.betaAccess) {
        user.betaAccess = true;
        await user.save();

        req.flash('info', 'You have been granted beta access.');
      }

      // Retrieve the user's journal
      let journal = await Journal.findOne({ user: user._id });

      // May not have a journal if the user must be approved for access
      if (!journal) {
        // Create default config
        const newConfig = new Config({
          model: { analysis: 'gpt-3.5-turbo-1106', chat: 'gpt-4' },
        });
        await newConfig.save();

        journal = new Journal({
          user: user._id,
          config: newConfig._id,
        });

        await journal.save();
      }

      if (token) req.flash('info', 'You will be logged out after 7 days.');

      req.flash(
        'success',
        `Welcome back, ${user.fname}. You've been logged in successfully.`
      );

      res.status(200).json({
        journalId: journal._id,
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
  if ((req as TokenRequest).token) {
    const { token } = req as TokenRequest;

    // Retrieve the user's journal
    const journal = await Journal.findOne({ user: token.id }).populate< { user: UserType } >('user');

    // If user has no journal or the token is expired, return error
    if (!journal) {
      return next(new ExpressError('Journal not found.', 404));
    }

    // Log the user in
    req.logIn(journal.user, async function (err) {
      if (err) {
        return next(err);
      }

      // Give existing users beta access
      if (process.env.RELEASE_PHASE === 'beta' && !journal.user?.betaAccess) {
        journal.user.betaAccess = true;
        await journal.user.save();

        req.flash('info', 'You have been granted beta access.');
      }

      // Show info message only for first 12 hours by iat timestamp
      if (token.iat === undefined) {
        // TODO: Intended behavior here? Currently backdate jwt by 30 seconds if undefined
        token.iat = Math.floor(Date.now() / 1000) - 30;
      }
      if (token.iat + 43200 > Date.now() / 1000) {
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
  } else {
    return next(new ExpressError('Token is invalid or has expired.', 403));
  }
};

/**
 * Forgot password.
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  // Search for user by email
  const { email } = req.body;

  // Search for user by email
  // TODO: not sure what selectHashSaltFields should be set to. Guessing false
  User.findByUsername(email, false, async (err, user) => {
    if (err) return next(err);

    // If user doesn't exist, return error
    if (!user)
      return next(new ExpressError('Could not send recovery email.', 400));

    // A decision has not been made if betaAccess is undefined
    if (process.env.RELEASE_PHASE === 'beta' && !user?.betaAccess) {
      // Prevent spamming the email server
      if (
        user.betaAccessTokenExpires > Date.now() &&
        user.betaAccess === false
      ) {
        return next(new ExpressError('You do not have beta access.', 403));
      }

      // Send email to admin alert admin of suspicious activity
      user.sendAlertForForgotPasswordAbuse(user.generateBetaAccessToken());
      user.betaAccess = false; // Prevent spamming the email server
      await user.save();

      return next(
        new ExpressError(
          'You do not have beta access. Admin has been flagged.',
          403
        )
      );
    }

    try {
      // Generate a password reset token
      const token = await user.generatePasswordResetToken();

      // Send password reset email
      await user.sendPasswordResetEmail(token);

      // Save the user with the new token and expiry
      await user.save();

      req.flash('success', 'Recovery email sent successfully.');
      res.status(200).json({ flash: req.flash() });
    } catch {
      return next(
        new ExpressError(
          'An error occurred while attempting to generate a recovery email.',
          500
        )
      );
    }
  });
};

/**
 * Reset password.
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { newPassword, token } = req.body;

  try {
    await AccountServices.resetPassword(newPassword, token);

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
    const { newUser, newJournal }= await AccountServices.createAccount(
      fname,
      lname,
      email,
      password,
      title
    );
    req.login(newUser, (err) => {
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
    const user = await AccountServices.verifyEmail(token);

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
