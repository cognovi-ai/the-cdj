import { Config, Entry, EntryAnalysis, EntryConversation, Journal, User } from '../../models/index.js';

import ExpressError from '../../utils/ExpressError.js';

import crypto from 'crypto';
import passport from 'passport';

import { validateJournal } from '../../middleware/validation.js';

/**
 * Get the user associated with a journal.
 */
export const getAccount = async (req, res, next) => {
  const { journalId } = req.params;

  try {
    const journal = await Journal.findById(journalId);
    if (!journal) return next(new ExpressError('Journal not found', 404));

    const user = await User.findById(journal.user);
    if (!user) return next(new ExpressError('User not found', 404));

    // Journal config is optional
    const config = await Config.findById(journal.config);

    // Decrypt the config's apiKey
    if (config) {
      config.apiKey = config.decrypt();
    }

    res.status(200).json({ user, config });
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
    if (!journal) return next(new ExpressError('Journal not found', 404));

    const { profile, password, config } = req.body;

    // Update the User model with the profile data
    if (profile) {
      // Find and update the user associated with the journal
      const user = await User.findByIdAndUpdate(journal.user, profile);
      if (!user) return next(new ExpressError('User not found', 404));
    }

    // Update the user's password
    if (password) {
      const user = await User.findById(journal.user);
      if (!user) return next(new ExpressError('User not found', 404));

      const { oldPassword, newPassword } = password;

      // Re-authenticate the user with the oldPassword
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return next(new ExpressError('Password is incorrect', 401));
      }

      // Update the user's password
      await user.setPassword(newPassword);
      await user.save();
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
        // Update chat and analysis fields separately
        if (model.chat) response.model.chat = model.chat;
        if (model.analysis) response.model.analysis = model.analysis;
      }
      if (apiKey) response.apiKey = response.encrypt(apiKey);

      await response.save();
    }

    res.status(200).json({ message: 'Account updated successfully.' });
  } catch (err) {
    return next(err);
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
      if (!journal) return next(new ExpressError('Journal not found', 404));

      // Delete the journal's config
      const config = await Config.findByIdAndDelete(journal.config);
      if (!config) return next(new ExpressError('Config not found', 404));

      res.status(200).json({ message: 'Config deleted successfully.' });
    } catch (err) {
      return next(err);
    }
  } else if (deletionItem === 'account') {
    try {
      const journal = await Journal.findById(journalId);
      if (!journal) return next(new ExpressError('Journal not found', 404));

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

      // Delete the journal's user
      const user = await User.findByIdAndDelete(journal.user);
      if (!user) return next(new ExpressError('User not found', 404));

      // Delete the journal
      await Journal.findByIdAndDelete(journalId);

      res.status(200).json({ message: 'Account deleted successfully.' });
    } catch (err) {
      return next(err);
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

      // Return the journal id and title
      res.status(200).json({ journalId: journal._id, journalTitle: journal.title });
    });
  })(req, res, next);
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
    if (!user) return next(new ExpressError('Could not send recovery email', 400));

    try {
      // Generate a password reset token
      const token = await user.generatePasswordResetToken();

      // Send password reset email
      await user.sendPasswordResetEmail(token);

      // Save the user with the new token and expiry
      await user.save();

      res.status(200).json({ message: 'Recovery email sent successfully.' });
    } catch (error) {
      // Handle any errors here
      return next(new ExpressError('Error during password recovery process', 500));
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
      return next(new ExpressError('Password reset token is invalid or has expired', 400));
    }

    // Reset password
    await user.setPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the updated user
    await user.save();

    // Send a confirmation email for the password reset
    await user.sendPasswordResetConfirmationEmail();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    // Handle any errors here
    return next(new ExpressError('Error during password reset process', 500));
  }
};

/**
 * Logout a user.
 */
export const logout = (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
  });
  res.status(200).json({ message: 'Logged out successfully.' });
};

/**
 * Register a new user.
 */
export const register = async (req, res, next) => {
  const { fname, lname, email, password } = req.body;

  try {
    const newUser = await User.register(new User({ email, fname, lname }), password);

    // Call validateJournal middleware
    validateJournal(req, res, async (err) => {
      if (err) return next(err); // Handle validation errors

      // Continue with creating the journal if validation is successful
      const newJournal = new Journal({ user: newUser._id, title: req.body.title });
      await newJournal.save();

      // Continue with the rest of the registration process
      req.login(newUser, err => {
        if (err) return next(err);
        res.status(200).json({ journalId: newJournal._id, journalTitle: newJournal.title });
      });
    });
  } catch (err) {
    return next(new ExpressError('Email already in use', 409));
  }
};
