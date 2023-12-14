import { Config, Entry, EntryAnalysis, EntryConversation, Journal, User } from '../../models/index.js';

import ExpressError from '../../utils/ExpressError.js';

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import passport from 'passport';

import { validateJournal } from '../../middleware/validation.js';

/**
 * Update the journal by accepted fields.
 */
export const updateJournal = async (req, res, next) => {
  const { journalId } = req.params;
  const { title } = req.body;

  try {
    const journal = await Journal.findById(journalId);
    if (!journal) return next(new ExpressError('Journal not found.', 404));

    if (title) {
      journal.title = title;
      await journal.save();
      req.flash('success', 'Journal title updated successfully.');
    } else {
      req.flash('warning', 'Journal title not updated.');
    }

    res.status(200).json({ flash: req.flash() });
  } catch (err) {
    return next(new ExpressError('An error occurred while attempting to update the journal.', 500));
  }
};

/**
 * Get the user associated with a journal.
 */
export const getAccount = async (req, res, next) => {
  const { journalId } = req.params;

  try {
    const journal = await Journal.findById(journalId);
    if (!journal) return next(new ExpressError('Journal not found.', 404));

    const user = await User.findById(journal.user);
    if (!user) return next(new ExpressError('User not found.', 404));

    // Journal config is optional
    const config = await Config.findById(journal.config);

    // Decrypt the config's apiKey
    if (config && config.apiKey) {
      config.apiKey = config.decrypt();
    } else {
      req.flash('info', 'Click the Config tab to complete your journal setup.');
    }

    req.flash('success', 'Found account information.');
    res.status(200).json({ user, config, flash: req.flash() });
  } catch (err) {
    return next(err);
  }
};

/**
 * Update the User and Config models by journalId.
 */
export const updateAccount = async (req, res, next) => {
  const { journalId } = req.params;

  try {
    const journal = await Journal.findById(journalId);
    if (!journal) return next(new ExpressError('Journal not found.', 404));

    const { profile, password, config } = req.body;

    // Update the User model with the profile data
    if (profile) {
      // Find and update the user associated with the journal
      const user = await User.findByIdAndUpdate(journal.user, profile);
      if (!user) return next(new ExpressError('User not found.', 404));
      req.flash('success', 'Profile updated successfully.');
    }

    // Update the user's password
    if (password) {
      const user = await User.findById(journal.user);
      if (!user) return next(new ExpressError('User not found.', 404));

      const { oldPassword, newPassword } = password;

      // Re-authenticate the user with the oldPassword
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return next(new ExpressError('Password is incorrect.', 401));
      }

      // Update the user's password
      await user.setPassword(newPassword);
      await user.save();

      req.flash('success', 'Password updated successfully.');
    }

    // Update the Config model with the config data
    if (config) {
      // Find config by journalId
      let response = await Config.findById(journal.config);

      // If the config doesn't exist, create it
      if (!response) {
        response = new Config(config);
        journal.config = response._id;
        await journal.save();
      }

      // Update the optional fields of the config
      const { model, apiKey } = config;

      if (model) {
        // Update chat and analysis fields if they exist in the request body
        if (model.chat !== undefined) model.chat ? response.model.chat = model.chat : response.model.chat = undefined;
        if (model.analysis !== undefined) model.analysis ? response.model.analysis = model.analysis : response.model.analysis = undefined;
      }

      // Update the apiKey field if it exists in the request body
      if (apiKey !== undefined) apiKey ? response.apiKey = response.encrypt(apiKey) : response.apiKey = undefined;

      await response.save();

      req.flash('success', 'Config updated successfully.');
    }

    // If the email was updated, re-authenticate the user
    if (profile?.email || password) {
      req.flash('info', 'Please log in again with your new credentials.');
    }

    res.status(200).json({ flash: req.flash() });
  } catch (err) {
    return next(new ExpressError('An error occurred while attempting to update the account.', 500));
  }
};

/**
 * Delete an item from the account endpoint of a journal.
 */
export const deleteItem = async (req, res, next) => {
  const { journalId } = req.params;
  const { deletionItem } = req.query;

  if (deletionItem === 'config') {
    try {
      const journal = await Journal.findById(journalId);
      if (!journal) return next(new ExpressError('Journal not found.', 404));

      // Delete the journal's config
      const config = await Config.findByIdAndDelete(journal.config);
      if (!config) return next(new ExpressError('Config not found.', 404));

      req.flash('success', 'Config deleted successfully.');
      res.status(200).json({ flash: req.flash() });
    } catch (err) {
      return next(err);
    }
  } else if (deletionItem === 'account') {
    try {
      const journal = await Journal.findById(journalId);
      if (!journal) return next(new ExpressError('Journal not found.', 404));

      // Delete the journal's user
      const user = await User.findByIdAndDelete(journal.user);
      if (!user) return next(new ExpressError('User not found.', 404));

      // Delete the journal's entries
      const entries = await Entry.find({ journal: journalId });

      for (const entry of entries) {
        // Delete the entry's analysis
        await EntryAnalysis.findByIdAndDelete(entry.analysis);

        // Delete the entry's conversation
        await EntryConversation.findByIdAndDelete(entry.conversation);

        // Delete the entry
        await Entry.findByIdAndDelete(entry._id);
      }

      // Delete the journal's config
      await Config.findByIdAndDelete(journal.config);

      // Delete the journal
      await Journal.findByIdAndDelete(journalId);

      req.flash('success', 'Account deleted successfully.');
      res.status(200).json({ flash: req.flash() });
    } catch (err) {
      return next(new ExpressError('An error occurred while attempting to delete the account.', 500));
    }
  }
};

/**
 * Login a user.
 */
export const login = async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }

    if (!user) {
      // Handle login failure
      return next(new ExpressError(info.message, 401));
    }

    // Generate a token if the user wants to be remembered
    let token;
    if (req.body.remember) {
      try {
        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      } catch (err) {
        req.flash('error', err.message);
      }
    }

    req.logIn(user, async (err) => {
      if (err) { return next(err); }
      // Handle successful login

      // Retrieve the user's journal
      const journal = await Journal.findOne({ user: user._id });

      // If user has no journal, create one
      if (!journal) {
        const newJournal = new Journal({
          user: user._id
        });
        await newJournal.save();
      }

      if (token) req.flash('info', 'You will be logged out after 7 days.');
      req.flash('success', 'Logged in successfully.');
      res.status(200).json({ journalId: journal._id, journalTitle: journal.title, flash: req.flash(), token });
    });
  })(req, res, next);
};

/**
 * Login a user with a token.
 */
export const tokenLogin = async (req, res, next) => {
  if (req.token) {
    const { token } = req;

    // Retrieve the user's journal
    const journal = await Journal.findOne({ user: token.id }).populate('user');

    // If user has no journal or the token is expired, return error
    if (!journal) {
      return next(new ExpressError('Journal not found.', 404));
    }

    // Log the user in
    req.logIn(journal.user, function (err) {
      // Show info message only for first 12 hours by iat timestamp
      if (token.iat + 43200 > Date.now() / 1000) req.flash('info', 'Logging out will prevent automatic future logins.');

      req.flash('success', 'Automatically logged in successfully.');

      if (err) { return next(err); }
      return res.status(200).json({ journalId: journal._id, journalTitle: journal.title, flash: req.flash() });
    });
  } else {
    return next(new ExpressError('Token is invalid or has expired.', 403));
  }
};

/**
 * Forgot password.
 */
export const forgotPassword = async (req, res, next) => {
  // Search for user by email
  const { email } = req.body;

  // Search for user by email
  User.findByUsername(email, async (err, user) => {
    if (err) return next(err);

    // If user doesn't exist, return error
    if (!user) return next(new ExpressError('Could not send recovery email.', 400));

    try {
      // Generate a password reset token
      const token = await user.generatePasswordResetToken();

      // Send password reset email
      await user.sendPasswordResetEmail(token);

      // Save the user with the new token and expiry
      await user.save();

      req.flash('success', 'Recovery email sent successfully.');
      res.status(200).json({ flash: req.flash() });
    } catch (error) {
      return next(new ExpressError('An error occurred while attempting to generate a recovery email.', 500));
    }
  });
};

/**
 * Reset password.
 */
export const resetPassword = async (req, res, next) => {
  const { newPassword, token } = req.body;

  try {
    // Hash the incoming token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Search for user by hashed token and check if token hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      // No user found, or token has expired
      return next(new ExpressError('Password reset token is invalid or has expired.', 400));
    }

    // Reset password
    await user.setPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the updated user
    await user.save();

    // Send a confirmation email for the password reset
    await user.sendPasswordResetConfirmationEmail();

    req.flash('success', 'Password reset successfully.');
    res.status(200).json({ flash: req.flash() });
  } catch (error) {
    // Handle any errors here
    return next(new ExpressError('An error occurred while attempting to reset the password.', 500));
  }
};

/**
 * Logout a user.
 */
export const logout = (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
  });

  req.flash('success', 'Logged out successfully.');
  res.status(200).json({ message: 'Logged out successfully.', flash: req.flash() });
};

/**
 * Register a new user.
 */
export const register = async (req, res, next) => {
  const { fname, lname, email, password } = req.body;

  try {
    const newUser = await User.register(new User({ email, fname, lname }), password).catch(err => {
      return next(err);
    });

    if (!newUser) return;

    // Call validateJournal middleware
    validateJournal(req, res, async (err) => {
      if (err) return next(err); // Handle validation errors

      // Continue with creating the journal if validation is successful
      const newJournal = new Journal({ user: newUser._id, title: req.body.title });
      await newJournal.save();

      // Continue with the rest of the registration process
      req.login(newUser, err => {
        if (err) return next(err);

        req.flash('success', 'Registered successfully.');
        res.status(200).json({ journalId: newJournal._id, journalTitle: newJournal.title, flash: req.flash() });
      });
    });
  } catch (err) {
    return next(new ExpressError('An error occurred while attempting to register the user.', 500));
  }
};
