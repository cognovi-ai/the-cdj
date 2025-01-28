import { Entry, EntryAnalysis, EntryConversation, Journal, User } from '../../index.js';
import ExpressError from '../../../utils/ExpressError.js';
import { HydratedDocument } from 'mongoose';
import { UserType } from '../../user.js';
import crypto from 'crypto';

/**
 * Get the user account information associated with a journal.
 * 
 * @param journalId id of journal associated with the account
 * @returns an object with the user for the journal.
 */
export async function getAccount(
  journalId: string,
) {
  const journal = await Journal.findById(journalId);
  if (!journal) throw new Error('Journal not found.');

  const user = await User.findById(journal.user);
  if (!user) throw new Error('User not found.');

  const result: {
    user: HydratedDocument<UserType>,
  } = {
    user: user,
  };

  return result;
}

/**
 * Get all journal information associated with a user.
 * 
 * @param userId id of user associated with the journal
 * @returns populated journal on success, null on failure
 */
export async function getPopulatedJournal(userId: string) {
  return await Journal
    .findOne({ user: userId })
    .populate<{ user: UserType }>('user');
}

/**
 * Updates title of Journal with journalId.
 * 
 * @param journalId id of journal associated with the account
 * @returns journal with updates on success, null on failure
 */
export async function updateJournalTitle(journalId: string, title: string) {
  const journal = await Journal.findById(journalId);
  if (!journal) throw new Error('Journal not found.');

  if (title) {
    journal.title = title;
    await journal.save();
    return journal;
  }
  return null;
}

/**
 * Updates User with userId with properties defined in profile object.
 * 
 * @param userId id of User to update
 * @param profile object with fname, lname, and email properties
 * @returns updated User if exists, else null
 */
export async function updateProfile(
  userId: string,
  profile: object
) {
  const updateProfileResponse: { user: HydratedDocument<UserType> | null, errorMessage: string | null } = {
    user: null,
    errorMessage: null
  };
  try {
    updateProfileResponse.user = await User.findByIdAndUpdate(userId, profile, { new: true });
    return updateProfileResponse;
  } catch {
    updateProfileResponse.errorMessage = 'The email address provided cannot be used.';
    return updateProfileResponse;
  }
}

/**
 * Updates User password to newPassword if oldPassword matches current password.
 * 
 * @param userId id of User to update
 * @param oldPassword user's original password
 * @param newPassword user's new password
 */
export async function updatePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const user = await User.findById(userId);
  if (!user) throw new ExpressError('User not found.', 404);

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw new ExpressError('Password is incorrect.', 401);

  await user.setPassword(newPassword);
  await user.save();
}

/**
 * Deletes the User, each Entry and each of the Entry's EntryAnalyses and 
 * EntryConversations and the Journal by journalId.
 * 
 * @param journalId id of journal associated with the account
 */
export async function deleteAccount(
  journalId: string
) {
  const journal = await Journal.findById(journalId);
  if (!journal) throw new ExpressError('Journal not found.', 404);

  const user = await User.findByIdAndDelete(journal.user);
  if (!user) throw new ExpressError('User not found.', 404);

  const entries = await Entry.find({ journal: journalId });

  for (const entry of entries) {
    await EntryAnalysis.findByIdAndDelete(entry.analysis);
    await EntryConversation.findByIdAndDelete(entry.conversation);
    await Entry.findByIdAndDelete(entry.id);
  }

  await Journal.findByIdAndDelete(journalId);
}

/**
 * Creates a new account by registering a user and associating the user with a 
 * journal.
 *
 * @param fname The first name of the user.
 * @param lname The last name of the user.
 * @param email The email address of the user.
 * @param password The password for the user account.
 * @param journalTitle The title of the journal to create for the user.
 * @returns A promise that resolves to an object containing the newly created 
 * user and journal.
 */
export async function createAccount(
  fname: string,
  lname: string,
  email: string,
  password: string,
  journalTitle: string,
) {
  const newUser = await User.register(
    new User({ email, fname, lname }),
    password
  );

  const newJournal = await Journal.create({
    user: newUser.id,
    title: journalTitle,
  });

  return { newUser, newJournal };
}

/**
 * Verifies a user's email address using a provided token.
 * 
 * This function hashes the provided token and searches for a user
 * with a matching `verifyEmailToken`. If a matching user is found,
 * their email is marked as verified, and the verification token and
 * expiration fields are cleared. If the application is in the beta
 * release phase and the user does not yet have beta access, a beta
 * access request email is sent to Support for approval.
 *
 * @async
 * @function verifyEmail
 * @param token - The email verification token provided by the user.
 * @returns A promise that resolves to the updated user object.
 * @throws {ExpressError} Throws an error if the token is invalid or no 
 * matching user is found.
 */
export async function verifyEmail(
  token: string
) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    verifyEmailToken: hashedToken,
  });
  
  if (!user) {
    throw new ExpressError('Email verification token is invalid.', 400);
  }
  
  user.emailVerified = true;
  user.verifyEmailToken = undefined;
  user.verifyEmailTokenExpires = undefined;
  
  if (process.env.RELEASE_PHASE === 'beta' && !user.betaAccess) {
    user.sendBetaRequestEmail(user.generateBetaAccessToken());
  }
  
  await user.save();
  return user;
}

/**
 * Resets a user's password using a provided reset token.
 * 
 * This function verifies the validity of the password reset token and ensures
 * that it has not expired. If the token is valid, it updates the user's 
 * password, clears the reset token and expiration fields, and sends a 
 * confirmation email to the user notifying them of the password change.
 *
 * @async
 * @function resetPassword
 * @param token - The password reset token provided by the user.
 * @param newPassword - The new password to set for the user.
 * @returns Resolves when the password has been successfully reset.
 * @throws {ExpressError} Throws an error if the token is invalid or has expired.
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ExpressError('Password reset token is invalid or has expired.', 400);
  }

  await user.setPassword(newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  await user.sendPasswordResetConfirmationEmail();
}

/**
 * Checks if a user is abusing the forgot password functionality during the 
 * beta phase.
 * 
 * If the user does not have beta access but their beta access token is still 
 * valid, this function sends an alert to the user, invalidates their beta 
 * access, and flags the issue by throwing an error. The admin is also notified 
 * of the abuse.
 * 
 * @param user - The user object to validate for abuse of the forgot password functionality.
 * 
 * @throws {ExpressError} - Throws a 403 error if the user does not have beta 
 * access and their beta access token is valid, or if they are flagged for abuse.
 */
async function checkForForgotPasswordAbuse(user: UserType) {
  if (
    user.betaAccessTokenExpires!.getTime() > Date.now() &&
    user.betaAccess === false
  ) {
    throw new ExpressError('You do not have beta access.', 403);
  }

  user.sendAlertForForgotPasswordAbuse(user.generateBetaAccessToken());
  user.betaAccess = false;
  await user.save();

  throw new ExpressError(
    'You do not have beta access. Admin has been flagged.',
    403
  );
}

/**
 * Handles the forgot password functionality by generating and sending a 
 * password reset email to the user.
 * 
 * This function retrieves the user by their email address. If the application 
 * is in the beta phase and the user does not have beta access, it validates 
 * for abuse of the forgot password functionality and may flag the user or 
 * prevent further actions. If the user is valid, a password reset token is 
 * generated, and an email is sent to the user with the reset link. The user 
 * record is updated accordingly.
 * 
 * @param email - The email address of the user requesting a password reset.
 * 
 * @throws {ExpressError} - Throws a 400 error if the user cannot be found, a 
 * 403 error if beta abuse is detected, or a 500 error if the reset token 
 * generation or email sending process fails.
 */
export async function forgotPassword(email: string) {
  const user = await User.findByUsername(email, false);
  if (!user) {
    throw new ExpressError('Could not send recovery email.', 400);
  }

  if (process.env.RELEASE_PHASE === 'beta' && !user.betaAccess) {
    await checkForForgotPasswordAbuse(user);
  }
  
  try {
    const token = user.generatePasswordResetToken();
    await user.sendPasswordResetEmail(token);
    await user.save();
  } catch {
    throw new ExpressError(
      'An error occurred while attempting to generate a recovery email.',
      500
    );
  }
}

/**
 * Ensures that a journal exists for a given user. If no journal is found, a 
 * new one is created and saved to the database.
 *
 * @param userId - The ID of the user for whom the journal is being checked or created.
 * @returns A promise that resolves to the user's journal, either retrieved or newly created.
 *
 * @throws Will propagate any errors that occur during database operations.
 */
export async function ensureJournalExists (userId: string) {
  let journal = await Journal.findOne({ user: userId });

  if (!journal) {
    journal = new Journal({
      user: userId,
    });

    await journal.save();
  }

  return journal;
}