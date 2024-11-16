import { Config, Journal, User } from '../index.js';
import { ConfigType } from '../config.js';
import { HydratedDocument } from 'mongoose';
import { UserType } from '../user.js';

/**
 * 
 * @param journalId 
 * @returns 
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
    setConfigMessage?: string
  } = {
    config: config,
    user: user,
  };

  // If the config doesn't exist instruct the user to set it up
  if (!config || !config.model.analysis || !config.model.chat) {
    result.setConfigMessage = 'Click the Config tab to complete your journal setup.';
  }
  return result;
}