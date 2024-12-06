/*
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as AccountServices from '../../../src/models/services/account.js';
import { Config, Entry, Journal, User } from '../../../src/models/index.js';
import mongoose, { HydratedDocument } from 'mongoose';
import user, { UserType } from '../../../src/models/user.js';
import { ConfigType } from '../../../src/models/config.js';
import ExpressError from '../../../src/utils/ExpressError.js';
import { JournalType } from '../../../src/models/journal.js';
import connectDB from '../../../src/db.js';

describe('Account services tests', () => {
  let mockUser: UserType;

  beforeAll(async () => {
    await connectDB('cdj');
  });

  beforeEach(async () => {
    mockUser = await User.register({
      fname: 'test fname',
      lname: 'test lname',
      email: 'testemail@fake.com',
    } as UserType, 'OldPassword123!');
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('getAccount tests', () => {
    it('gets user and config without message for getAccount when config set', async () => {
      const mockConfig = await Config.create({
        model: {
          chat: 'test chat model',
          analysis: 'test analysis model'
        }
      });
      const mockJournal = await Journal.create({ 
        user: mockUser.id,
        config: mockConfig.id,
      });
  
      const { user, config, configMessage } = await AccountServices.getAccount(mockJournal.id);
      
      expect(user.id).toBe(mockUser.id);
      expect(config!.id).toBe(mockConfig.id);
      expect(configMessage).toBeUndefined();
    });
  
    it('gets user, config, and message for getAccount when config not set', async () => {
      const mockJournal = await Journal.create({ user: mockUser.id });
  
      const { user, config, configMessage } = await AccountServices.getAccount(mockJournal.id);
      
      expect(user.id).toBe(mockUser.id);
      expect(config).toBe(config);
      expect(configMessage).toBe('Click the Config tab to complete your journal setup.');
    });
  
    it('throws error if journal not found', async () => {
      const mockJournal = new Journal({ user: mockUser.id });
      await expect(
        AccountServices.getAccount(mockJournal.id)
      ).rejects.toThrow('Journal not found.');
    });
  
    it('throws error if user not found', async () => {
      await User.findByIdAndDelete(mockUser.id);
      const mockJournal = await Journal.create({ user: mockUser.id });
      await expect(
        AccountServices.getAccount(mockJournal.id)
      ).rejects.toThrow('User not found.');
    });
  });

  describe('updateJournal tests', () => {
    it('returns true if journal updates successfully', async () => {
      const mockJournal = await Journal.create({ user: mockUser.id });
  
      const result = await AccountServices.updateJournal(mockJournal.id, 'New Title');
  
      expect(result).toBeDefined();
      expect(result!.title).toBe('New Title');
    });

    it('returns false if title is empty', async () => {
      const mockJournal = await Journal.create({ user: mockUser.id, title: 'Old Title' });
  
      const result = await AccountServices.updateJournal(mockJournal.id, '');
  
      expect(result).toBeNull();
    });

    it('throws error if journal not found', async () => {
      const mockJournal = new Journal({ user: mockUser.id });
  
      await expect(
        AccountServices.updateJournal(mockJournal.id, 'New Title')
      ).rejects.toThrow();
    });
  });

  describe('updateProfile tests', () => {
    
    it('should update the user profile successfully', async () => {
      const profileUpdate = { fname: 'Jane', lname: 'Doe', email: 'janedoe@example.com' };

      const { user, errorMessage } = await AccountServices.updateProfile(mockUser.id, profileUpdate);
      
      expect(errorMessage).toBeNull();
      expect(user!.id).toEqual(mockUser.id);
      expect(user!.fname).toEqual(profileUpdate.fname);
      expect(user!.lname).toEqual(profileUpdate.lname);
      expect(user!.email).toEqual(profileUpdate.email);
    });
  
    it('should return an error when the userId is invalid', async () => {
      const invalidId = 'invalid-object-id';

      const { user, errorMessage } = await AccountServices.updateProfile(invalidId as any, { fname: 'Invalid' });

      expect(user).toBeNull();
      expect(errorMessage).toEqual('The email address provided cannot be used.');
    });
  
    it('should handle database errors gracefully', async () => {
      const profileUpdate = { name: 'Jane Doe', email: 'janedoe@example.com' };
      jest.spyOn(User, 'findByIdAndUpdate').mockRejectedValueOnce(
        new Error('Database error')
      );

      const { user, errorMessage } = await AccountServices.updateProfile(mockUser.id, profileUpdate);

      expect(user).toBeNull();
      expect(errorMessage).toEqual('The email address provided cannot be used.');
    });
  });

  describe('updatePassword tests', () => {

    it('should successfully update the password', async () => {
      const oldPassword = 'OldPassword123!';
      const newPassword = 'NewPassword123!';
  
      await AccountServices.updatePassword(mockUser.id, oldPassword, newPassword);
  
      const updatedUser = await User.findById(mockUser.id);
      const isMatch = await updatedUser?.comparePassword(newPassword);
  
      expect(isMatch).toBe(true);
    });
  
    it('should throw an error if the user does not exist', async () => {
      const nonexistentUser = new User({
        fname: 'test fname',
        lname: 'test lname',
        email: 'testemail@fake.com',
      });
      const oldPassword = 'OldPassword123!';
      const newPassword = 'NewPassword123!';
  
      await expect(
        AccountServices.updatePassword(nonexistentUser.id, oldPassword, newPassword)
      ).rejects.toThrow(new ExpressError('User not found.', 404));
    });
  
    it('should throw an error if the old password is incorrect', async () => {
      const incorrectOldPassword = 'WrongPassword123!';
      const newPassword = 'NewPassword123!';
  
      await expect(
        AccountServices.updatePassword(mockUser.id, incorrectOldPassword, newPassword)
      ).rejects.toThrow(new ExpressError('Password is incorrect.', 401));
    });
  
    it('should not update the password if saving fails', async () => {
      const oldPassword = 'OldPassword123!';
      const newPassword = 'NewPassword123!';
  
      jest.spyOn(User.prototype, 'save').mockRejectedValueOnce(
        new Error('Database save failed.')
      );
  
      await expect(
        AccountServices.updatePassword(mockUser.id, oldPassword, newPassword)
      ).rejects.toThrow('Database save failed.');
  
      const updatedUser = await User.findById(mockUser.id);
      const isMatch = await updatedUser?.comparePassword(oldPassword);
  
      expect(isMatch).toBe(true);
    });
  });

  describe('updateConfig tests', () => {
    let journal: HydratedDocument<JournalType>;
    
    beforeEach(async () => {
      journal = await Journal.create({
        title: 'Test Journal',
        user: mockUser.id
      });
    });

    it('should create a new configuration if none exists', async () => {
      const newConfig: ConfigType = {
        model: { chat: 'chatModel', analysis: 'analysisModel' },
      } as ConfigType;
  
      await AccountServices.updateConfig(undefined, journal, newConfig);
  
      const updatedJournal = await Journal
        .findById(journal.id)
        .populate<{ config: ConfigType }>('config');
      expect(updatedJournal?.config).toBeDefined();
      expect(updatedJournal?.config.model.chat).toBe(newConfig.model.chat);
      expect(updatedJournal?.config.model.analysis).toBe(newConfig.model.analysis);
    });
  
    it('should update an existing configuration', async () => {
      const existingConfig = await Config.create({
        model: { chat: 'chatModel', analysis: 'analysisModel' },
      } as ConfigType);
  
      journal.config = existingConfig._id;
      await journal.save();
  
      const updatedConfig: ConfigType = {
        model: { chat: 'updatedChatModel', analysis: undefined },
      } as ConfigType;
  
      await AccountServices.updateConfig(existingConfig.id, journal, updatedConfig);
  
      const reloadedConfig = await Config.findById(existingConfig.id);
      expect(reloadedConfig).toBeDefined();
      expect(reloadedConfig?.model.chat).toBe(updatedConfig.model.chat);
      expect(reloadedConfig?.model.analysis).toBeUndefined();
    });
  
    it('should handle an undefined model field in the new configuration', async () => {
      const newConfig: ConfigType = {
        model: {},
      } as ConfigType;
  
      await AccountServices.updateConfig(undefined, journal, newConfig);
  
      const updatedJournal = await Journal
        .findById(journal.id)
        .populate<{ config: ConfigType }>('config');
      expect(updatedJournal!.config).toBeDefined();
      expect(updatedJournal!.config.model).toBeDefined();
      expect(updatedJournal!.config.model.analysis).toBeUndefined();
      expect(updatedJournal!.config.model.chat).toBeUndefined();
    });
  
    it('should preserve unrelated fields when updating configuration', async () => {
      const existingConfig = await Config.create({
        model: { chat: 'chatModel', analysis: 'analysisModel' },
        apiKey: 'apiKey',
      });
  
      journal.config = existingConfig._id;
      await journal.save();
  
      const updatedConfig: ConfigType = {
        model: { chat: 'updatedChatModel' },
      } as ConfigType;
  
      await AccountServices.updateConfig(existingConfig.id, journal, updatedConfig);
  
      const reloadedConfig = await Config.findById(existingConfig._id);
      expect(reloadedConfig).toBeDefined();
      expect(reloadedConfig?.model.chat).toBe('updatedChatModel');
      expect(reloadedConfig?.model.analysis).toBeUndefined();
      expect(reloadedConfig?.apiKey).toBe('apiKey');
    });
  });

  describe('deleteConfig', () => {
    it('should delete the associated config if the journal exists', async () => {
      const config = await Config.create({
        model: { chat: 'chatModel', analysis: 'analysisModel' },
      });
      const journal = await Journal.create({ 
        user: mockUser.id,
        config: config.id
      });
  
      await AccountServices.deleteConfig(journal.id.toString());
  
      const deletedConfig = await Config.findById(config.id);
      const deletedJournal = await Journal.findById(journal.id);
  
      expect(deletedConfig).toBeNull();
      expect(deletedJournal).not.toBeNull();
    });
  
    it('should throw an error if the journal does not exist', async () => {
      const nonExistentJournalId = new mongoose.Types.ObjectId().toString();
  
      await expect(AccountServices.deleteConfig(nonExistentJournalId))
        .rejects
        .toThrow(ExpressError);
      await expect(AccountServices.deleteConfig(nonExistentJournalId))
        .rejects
        .toThrow('Journal not found.');
    });
  
    it('should throw an error if the config does not exist', async () => {
      const nonExistentConfigId = new mongoose.Types.ObjectId();
      const journal = await Journal.create({
        user: mockUser.id,
        config: nonExistentConfigId
      });
  
      await expect(AccountServices.deleteConfig(journal.id))
        .rejects
        .toThrow(ExpressError);
      await expect(AccountServices.deleteConfig(journal.id))
        .rejects
        .toThrow('Config not found.');
    });
  });

  describe('deleteAccount', () => {
    it('should delete the journal, user, entries, and related data', async () => {
      const config = await Config.create({
        model: { chat: 'chatModel', analysis: 'analysisModel' },
      });
      const journal = await Journal.create({
        user: mockUser.id,
        config: config.id
      });
  
      await Entry.create({
        journal: journal.id,
        analysis: new mongoose.Types.ObjectId(),
        conversation: new mongoose.Types.ObjectId(),
        content: 'entry1 content'
      });
      await Entry.create({
        journal: journal.id,
        analysis: new mongoose.Types.ObjectId(),
        conversation: new mongoose.Types.ObjectId(),
        content: 'entry2 content'
      });
  
      await AccountServices.deleteAccount(journal.id);

      const deletedJournal = await Journal.findById(journal.id);
      const deletedUser = await User.findById(mockUser.id);
      const deletedConfig = await Config.findById(config.id);
      const remainingEntries = await Entry.find({ journal: journal.id });
  
      expect(deletedJournal).toBeNull();
      expect(deletedUser).toBeNull();
      expect(deletedConfig).toBeNull();
      expect(remainingEntries).toHaveLength(0);
    });
  
    it('should throw an error if the journal does not exist', async () => {
      const nonExistentJournalId = new mongoose.Types.ObjectId().toString();
  
      await expect(AccountServices.deleteAccount(nonExistentJournalId)).rejects.toThrow(ExpressError);
      await expect(AccountServices.deleteAccount(nonExistentJournalId)).rejects.toThrow('Journal not found.');
    });
  
    it('should throw an error if the user does not exist', async () => {
      const config = await Config.create({
        model: { chat: 'chatModel', analysis: 'analysisModel' },
      });
      const journal = await Journal.create({
        user: new mongoose.Types.ObjectId(),
        config: config.id
      });
  
      await expect(AccountServices.deleteAccount(journal.id))
        .rejects
        .toThrow(ExpressError);
      await expect(AccountServices.deleteAccount(journal.id))
        .rejects
        .toThrow('User not found.');
    });
  
    it('should handle journals with no entries gracefully', async () => {
      const config = await Config.create({
        model: { chat: 'chatModel', analysis: 'analysisModel' },
      });
      const journal = await Journal.create({
        title: 'Test Journal',
        user: mockUser.id,
        config: config.id
      });
  
      await AccountServices.deleteAccount(journal.id);
  
      const deletedJournal = await Journal.findById(journal.id);
      const deletedUser = await User.findById(mockUser.id);
      const deletedConfig = await Config.findById(config.id);
  
      expect(deletedJournal).toBeNull();
      expect(deletedUser).toBeNull();
      expect(deletedConfig).toBeNull();
    });
  });

  describe('createAccount', () => {
    it('should create a new user, configuration, and journal', async () => {
      const fname = 'John';
      const lname = 'Doe';
      const email = 'john.doe@example.com';
      const password = 'securePassword';
      const journalTitle = 'My First Journal';
  
      const { newUser, newJournal } = await AccountServices.createAccount(fname, lname, email, password, journalTitle);
  
      const user = await User.findById(newUser.id);
      expect(user).not.toBeNull();
      expect(user?.email).toBe(email);
      expect(user?.fname).toBe(fname);
      expect(user?.lname).toBe(lname);
  
      const config = await Config.findById(newJournal.config);
      expect(config).not.toBeNull();
      expect(config?.model.analysis).toBe('gpt-3.5-turbo-1106');
      expect(config?.model.chat).toBe('gpt-4');
  
      const journal = await Journal.findById(newJournal.id);
      expect(journal).not.toBeNull();
      expect(journal?.title).toBe(journalTitle);
      expect(journal?.user.toString()).toBe(newUser.id);
      expect(journal?.config?.toString()).toBe(config?.id);
    });
  });

  describe('verifyEmail', () => {
    const mockSendBetaRequestEmail = jest.fn();

    beforeEach(() => {
      jest.spyOn(User.prototype, 'sendBetaRequestEmail').mockImplementation(mockSendBetaRequestEmail);
    });
    
    it('should verify a user’s email when a valid token is provided', async () => {
      const token = mockUser.generateEmailVerificationToken();
      await mockUser.save();
  
      const verifiedUser = await AccountServices.verifyEmail(token);
  
      const updatedUser = await User.findById(mockUser.id);
      expect(updatedUser?.emailVerified).toBe(true);
      expect(updatedUser?.verifyEmailToken).toBeUndefined();
      expect(updatedUser?.verifyEmailTokenExpires).toBeUndefined();
      expect(verifiedUser.id).toBe(mockUser.id);
    });
  
    it('should throw an error if the token is invalid', async () => {
      mockUser.generateEmailVerificationToken();
      await mockUser.save();
  
      const invalidToken = 'invalid-token';
      await expect(AccountServices.verifyEmail(invalidToken)).rejects.toThrow(
        'Email verification token is invalid.'
      );
    });
  
    it('should throw an error if no matching user is found for the token', async () => {
      const randomToken = 'random-token';
      await expect(AccountServices.verifyEmail(randomToken)).rejects.toThrow(
        'Email verification token is invalid.'
      );
    });
  
    it('should send a beta access email if the user is in beta phase and does not already have beta access', async () => {
      const ORIGINAL_RELEASE_PHASE = process.env.RELEASE_PHASE;
      process.env.RELEASE_PHASE = 'beta';
      const token = mockUser.generateEmailVerificationToken();
      await mockUser.save();
  
      await AccountServices.verifyEmail(token);
        
      expect(mockSendBetaRequestEmail).toHaveBeenCalledTimes(1);
      process.env.RELEASE_PHASE = ORIGINAL_RELEASE_PHASE;
    });
  
    it('should not send a beta access email if the user already has beta access', async () => {
      const ORIGINAL_RELEASE_PHASE = process.env.RELEASE_PHASE;
      process.env.RELEASE_PHASE = 'beta';
  
      const token = mockUser.generateEmailVerificationToken();
      mockUser.betaAccess = true;
      await mockUser.save();
  
      await AccountServices.verifyEmail(token);
  
      expect(mockSendBetaRequestEmail).not.toHaveBeenCalled();
      process.env.RELEASE_PHASE = ORIGINAL_RELEASE_PHASE;
    });
  });

  describe('resetPassword', () => {  
    it('should reset the password when a valid token is provided', async () => {
      const mockSetPassword = jest.fn();
      const mockSendPasswordResetConfirmationEmail = jest.fn();
      jest.spyOn(User.prototype, 'setPassword')
        .mockImplementation(mockSetPassword);
      jest.spyOn(User.prototype, 'sendPasswordResetConfirmationEmail')
        .mockImplementation(mockSendPasswordResetConfirmationEmail);

      const token = mockUser.generatePasswordResetToken();
      await mockUser.save();
  
      await AccountServices.resetPassword(token, 'newPassword123');
  
      const updatedUser = await User.findById(mockUser.id);
      expect(mockUser.setPassword).toHaveBeenCalledWith('newPassword123');
      expect(updatedUser?.resetPasswordToken).toBeUndefined();
      expect(updatedUser?.resetPasswordExpires).toBeUndefined();
  
      expect(mockUser.sendPasswordResetConfirmationEmail).toHaveBeenCalled();
    });
  
    it('should throw an error if the token is invalid', async () => {
      mockUser.generatePasswordResetToken();
      await mockUser.save();
  
      const invalidToken = 'invalid-token';
      await expect(AccountServices.resetPassword(invalidToken, 'newPassword123')).rejects.toThrow(
        'Password reset token is invalid or has expired.'
      );
    });
  
    it('should throw an error if the token has expired', async () => {
      const token = mockUser.generatePasswordResetToken();
      mockUser.resetPasswordExpires = new Date(Date.now() - 3600000);
      await mockUser.save();
  
      await expect(AccountServices.resetPassword(token, 'newPassword123')).rejects.toThrow(
        'Password reset token is invalid or has expired.'
      );
    });
  
    it('should ensure the resetPasswordToken and resetPasswordExpires fields are cleared after a successful reset', async () => {
      const token = mockUser.generatePasswordResetToken();
      await mockUser.save();
  
      await AccountServices.resetPassword(token, 'newPassword123');
  
      const updatedUser = await User.findById(mockUser.id);
      expect(updatedUser?.resetPasswordToken).toBeUndefined();
      expect(updatedUser?.resetPasswordExpires).toBeUndefined();
    });
  
    it('should send a password reset confirmation email after successfully resetting the password', async () => {
      const mockSetPassword = jest.fn();
      const mockSendPasswordResetConfirmationEmail = jest.fn();
      jest.spyOn(User.prototype, 'setPassword')
        .mockImplementation(mockSetPassword);
      jest.spyOn(User.prototype, 'sendPasswordResetConfirmationEmail')
        .mockImplementation(mockSendPasswordResetConfirmationEmail);
      
      const token = mockUser.generatePasswordResetToken();
      await mockUser.save();

      await AccountServices.resetPassword(token, 'newPassword123');
  
      expect(mockSendPasswordResetConfirmationEmail).toHaveBeenCalled();
    });
  });
});