import { Config, Journal, User } from '../index.js';
import { ConfigType } from '../config.js';
import ExpressError from '../../utils/ExpressError.js';
import { HydratedDocument } from 'mongoose';
import { JournalType } from '../journal.js';
import { UserType } from '../user.js';

/**
 * Get the user account information associated with a journal.
 * 
 * @param journalId the id of the journal associated with the account
 * @returns an object with the user and config for the journal and an optional 
 * message to set the config
 */
export async function getAccount(
  journalId: string,
) {
  const journal = await Journal.findById(journalId);
  if (!journal) throw new Error('Journal not found.');

  const user = await User.findById(journal.user);
  if (!user) throw new Error('User not found.');

  // Journal config is optional
  const config = await Config.findById(journal.config);

  const result: {
    config: HydratedDocument<ConfigType> | null,
    user: HydratedDocument<UserType>,
    configMessage?: string
  } = {
    config: config,
    user: user,
  };

  // If the config doesn't exist instruct the user to set it up
  if (!config || !config.model.analysis || !config.model.chat) {
    result.configMessage = 'Click the Config tab to complete your journal setup.';
  }
  return result;
}

/**
 * Updates title of Journal with journalId.
 * 
 * @param journalId string of journalId
 * @returns journal with updates on success, null on failure
 */
export async function updateJournal(journalId: string, title: string) {
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
 * Updates User Config with information in config.
 * Creates Config and links to journal if undefined.
 * 
 * @param configId id of Config to update
 * @param journal Journal document linked to Config with configId
 * @param config Config JSON with properties to update
 */
export async function updateConfig(
  configId: string | undefined,
  journal: HydratedDocument<JournalType>,
  config: ConfigType
): Promise<void> {
  let response = await Config.findById(configId);

  if (!response) {
    response = new Config(config);
    journal.config = response._id;
    await journal.save();
  }

  const { model } = config;

  if (model) {
    response.model.chat = model.chat ?? undefined;
    response.model.analysis = model.analysis ?? undefined;
  }

  await response.save();
}