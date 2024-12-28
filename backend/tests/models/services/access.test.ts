/*
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as AccessServices from '../../../src/models/services/access.js';
import { Config, Entry, Journal, User } from '../../../src/models/index.js';
import mongoose, { HydratedDocument } from 'mongoose';
import { ConfigType } from '../../../src/models/config.js';
import ExpressError from '../../../src/utils/ExpressError.js';
import { JournalType } from '../../../src/models/journal.js';
import { UserType } from '../../../src/models/user.js';
import connectDB from '../../../src/db.js';

describe('Account services tests', () => {
  let testUser: UserType;

  beforeAll(async () => {
    await connectDB('cdj');
  });

  beforeEach(async () => {
    testUser = await User.register({
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
      const testConfig = await Config.create({
        model: {
          chat: 'test chat model',
          analysis: 'test analysis model'
        }
      });
      const mockJournal = await Journal.create({ 
        user: testUser.id,
        config: testConfig.id,
      });
  
      const { user, config, configMessage } = await AccessServices.getAccount(mockJournal.id);
      
      expect(user.id).toBe(testUser.id);
      expect(config!.id).toBe(testConfig.id);
      expect(configMessage).toBeUndefined();
    });
  
    it('gets user, config, and message for getAccount when config not set', async () => {
      const testJournal = await Journal.create({ user: testUser.id });
  
      const { user, config, configMessage } = await AccessServices.getAccount(testJournal.id);
      
      expect(user.id).toBe(testUser.id);
      expect(config).toBe(config);
      expect(configMessage).toBe('Click the Config tab to complete your journal setup.');
    });
  
    it('throws error if journal not found', async () => {
      const testJournal = new Journal({ user: testUser.id });
      await expect(
        AccessServices.getAccount(testJournal.id)
      ).rejects.toThrow('Journal not found.');
    });
  
    it('throws error if user not found', async () => {
      await User.findByIdAndDelete(testUser.id);
      const testJournal = await Journal.create({ user: testUser.id });
      await expect(
        AccessServices.getAccount(testJournal.id)
      ).rejects.toThrow('User not found.');
    });
  });

  describe('updateJournal tests', () => {
    it('returns true if journal updates successfully', async () => {
      const testJournal = await Journal.create({ user: testUser.id });
  
      const result = await AccessServices.updateJournalTitle(testJournal.id, 'New Title');
  
      expect(result).toBeDefined();
      expect(result!.title).toBe('New Title');
    });

    it('returns false if title is empty', async () => {
      const testJournal = await Journal.create({ user: testUser.id, title: 'Old Title' });
  
      const result = await AccessServices.updateJournalTitle(testJournal.id, '');
  
      expect(result).toBeNull();
    });

    it('throws error if journal not found', async () => {
      const testJournal = new Journal({ user: testUser.id });
  
      await expect(
        AccessServices.updateJournalTitle(testJournal.id, 'New Title')
      ).rejects.toThrow();
    });
  });

  describe('updateProfile tests', () => {
    it('should update the user profile successfully', async () => {
      const profileUpdate = { fname: 'Jane', lname: 'Doe', email: 'janedoe@example.com' };

      const { user, errorMessage } = await AccessServices.updateProfile(testUser.id, profileUpdate);
      
      expect(errorMessage).toBeNull();
      expect(user!.id).toEqual(testUser.id);
      expect(user!.fname).toEqual(profileUpdate.fname);
      expect(user!.lname).toEqual(profileUpdate.lname);
      expect(user!.email).toEqual(profileUpdate.email);
    });
  
    it('should return an error when the userId is invalid', async () => {
      const invalidId = 'invalid-object-id';

      const { user, errorMessage } = await AccessServices.updateProfile(invalidId as any, { fname: 'Invalid' });

      expect(user).toBeNull();
      expect(errorMessage).toEqual('The email address provided cannot be used.');
    });
  
    it('should handle database errors gracefully', async () => {
      const profileUpdate = { name: 'Jane Doe', email: 'janedoe@example.com' };
      jest.spyOn(User, 'findByIdAndUpdate').mockRejectedValueOnce(
        new Error('Database error')
      );

      const { user, errorMessage } = await AccessServices.updateProfile(testUser.id, profileUpdate);

      expect(user).toBeNull();
      expect(errorMessage).toEqual('The email address provided cannot be used.');
    });
  });

  describe('updatePassword tests', () => {
    it('should successfully update the password', async () => {
      const oldPassword = 'OldPassword123!';
      const newPassword = 'NewPassword123!';
  
      await AccessServices.updatePassword(testUser.id, oldPassword, newPassword);
  
      const updatedUser = await User.findById(testUser.id);
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
        AccessServices.updatePassword(nonexistentUser.id, oldPassword, newPassword)
      ).rejects.toThrow(new ExpressError('User not found.', 404));
    });
  
    it('should throw an error if the old password is incorrect', async () => {
      const incorrectOldPassword = 'WrongPassword123!';
      const newPassword = 'NewPassword123!';
  
      await expect(
        AccessServices.updatePassword(testUser.id, incorrectOldPassword, newPassword)
      ).rejects.toThrow(new ExpressError('Password is incorrect.', 401));
    });
  
    it('should not update the password if saving fails', async () => {
      const oldPassword = 'OldPassword123!';
      const newPassword = 'NewPassword123!';
  
      jest.spyOn(User.prototype, 'save').mockRejectedValueOnce(
        new Error('Database save failed.')
      );
  
      await expect(
        AccessServices.updatePassword(testUser.id, oldPassword, newPassword)
      ).rejects.toThrow('Database save failed.');
  
      const updatedUser = await User.findById(testUser.id);
      const isMatch = await updatedUser?.comparePassword(oldPassword);
  
      expect(isMatch).toBe(true);
    });
  });

  describe('updateConfig tests', () => {
    let testJournal: HydratedDocument<JournalType>;
    
    beforeEach(async () => {
      testJournal = await Journal.create({
        title: 'Test Journal',
        user: testUser.id
      });
    });

    it('should create a new configuration if none exists', async () => {
      const testConfig: ConfigType = {
        model: { chat: 'chatModel', analysis: 'analysisModel' },
      } as ConfigType;
  
      await AccessServices.updateConfig(undefined, testJournal, testConfig);
  
      const updatedJournal = await Journal
        .findById(testJournal.id)
        .populate<{ config: ConfigType }>('config');
      expect(updatedJournal?.config).toBeDefined();
      expect(updatedJournal?.config.model.chat).toBe(testConfig.model.chat);
      expect(updatedJournal?.config.model.analysis).toBe(testConfig.model.analysis);
    });
  
    it('should update an existing configuration', async () => {
      const testConfig = await Config.create({
        model: { chat: 'chatModel', analysis: 'analysisModel' },
      } as ConfigType);
  
      testJournal.config = testConfig._id;
      await testJournal.save();
  
      const updatedConfig: ConfigType = {
        model: { chat: 'updatedChatModel', analysis: undefined },
      } as ConfigType;
  
      await AccessServices.updateConfig(testConfig.id, testJournal, updatedConfig);
  
      const reloadedConfig = await Config.findById(testConfig.id);
      expect(reloadedConfig).toBeDefined();
      expect(reloadedConfig?.model.chat).toBe(updatedConfig.model.chat);
      expect(reloadedConfig?.model.analysis).toBeUndefined();
    });
  
    it('should handle an undefined model field in the new configuration', async () => {
      const testConfig: ConfigType = {
        model: {},
      } as ConfigType;
  
      await AccessServices.updateConfig(undefined, testJournal, testConfig);
  
      const updatedJournal = await Journal
        .findById(testJournal.id)
        .populate<{ config: ConfigType }>('config');
      expect(updatedJournal!.config).toBeDefined();
      expect(updatedJournal!.config.model).toBeDefined();
      expect(updatedJournal!.config.model.analysis).toBeUndefined();
      expect(updatedJournal!.config.model.chat).toBeUndefined();
    });
  
    it('should preserve unrelated fields when updating configuration', async () => {
      const testConfig = await Config.create({
        model: { chat: 'chatModel', analysis: 'analysisModel' },
        apiKey: 'apiKey',
      });
  
      testJournal.config = testConfig._id;
      await testJournal.save();
  
      const updatedConfig: ConfigType = {
        model: { chat: 'updatedChatModel' },
      } as ConfigType;
  
      await AccessServices.updateConfig(testConfig.id, testJournal, updatedConfig);
  
      const reloadedConfig = await Config.findById(testConfig._id);
      expect(reloadedConfig).toBeDefined();
      expect(reloadedConfig?.model.chat).toBe('updatedChatModel');
      expect(reloadedConfig?.model.analysis).toBeUndefined();
      expect(reloadedConfig?.apiKey).toBe('apiKey');
    });
  });

  describe('deleteConfig', () => {
    it('should delete the associated config if the journal exists', async () => {
      const testConfig = await Config.create({
        model: { chat: 'chatModel', analysis: 'analysisModel' },
      });
      const testJournal = await Journal.create({ 
        user: testUser.id,
        config: testConfig.id
      });
  
      await AccessServices.deleteConfig(testJournal.id.toString());
  
      const deletedConfig = await Config.findById(testConfig.id);
      const deletedJournal = await Journal.findById(testJournal.id);
  
      expect(deletedConfig).toBeNull();
      expect(deletedJournal).not.toBeNull();
    });
  
    it('should throw an error if the journal does not exist', async () => {
      const nonExistentJournalId = new mongoose.Types.ObjectId().toString();
  
      await expect(AccessServices.deleteConfig(nonExistentJournalId))
        .rejects
        .toThrow(ExpressError);
      await expect(AccessServices.deleteConfig(nonExistentJournalId))
        .rejects
        .toThrow('Journal not found.');
    });
  
    it('should throw an error if the config does not exist', async () => {
      const nonExistentConfigId = new mongoose.Types.ObjectId();
      const testJournal = await Journal.create({
        user: testUser.id,
        config: nonExistentConfigId
      });
  
      await expect(AccessServices.deleteConfig(testJournal.id))
        .rejects
        .toThrow(ExpressError);
      await expect(AccessServices.deleteConfig(testJournal.id))
        .rejects
        .toThrow('Config not found.');
    });
  });

  describe('deleteAccount', () => {
    it('should delete the journal, user, entries, and related data', async () => {
      const testConfig = await Config.create({
        model: { chat: 'chatModel', analysis: 'analysisModel' },
      });
      const testJournal = await Journal.create({
        user: testUser.id,
        config: testConfig.id
      });
  
      await Entry.create({
        journal: testJournal.id,
        analysis: new mongoose.Types.ObjectId(),
        conversation: new mongoose.Types.ObjectId(),
        content: 'entry1 content'
      });
      await Entry.create({
        journal: testJournal.id,
        analysis: new mongoose.Types.ObjectId(),
        conversation: new mongoose.Types.ObjectId(),
        content: 'entry2 content'
      });
  
      await AccessServices.deleteAccount(testJournal.id);

      const deletedJournal = await Journal.findById(testJournal.id);
      const deletedUser = await User.findById(testUser.id);
      const deletedConfig = await Config.findById(testConfig.id);
      const remainingEntries = await Entry.find({ journal: testJournal.id });
  
      expect(deletedJournal).toBeNull();
      expect(deletedUser).toBeNull();
      expect(deletedConfig).toBeNull();
      expect(remainingEntries).toHaveLength(0);
    });
  
    it('should throw an error if the journal does not exist', async () => {
      const nonExistentJournalId = new mongoose.Types.ObjectId().toString();
  
      await expect(AccessServices.deleteAccount(nonExistentJournalId)).rejects.toThrow(ExpressError);
      await expect(AccessServices.deleteAccount(nonExistentJournalId)).rejects.toThrow('Journal not found.');
    });
  
    it('should throw an error if the user does not exist', async () => {
      const testConfig = await Config.create({
        model: { chat: 'chatModel', analysis: 'analysisModel' },
      });
      const testJournal = await Journal.create({
        user: new mongoose.Types.ObjectId(),
        config: testConfig.id
      });
  
      await expect(AccessServices.deleteAccount(testJournal.id))
        .rejects
        .toThrow(ExpressError);
      await expect(AccessServices.deleteAccount(testJournal.id))
        .rejects
        .toThrow('User not found.');
    });
  
    it('should handle journals with no entries gracefully', async () => {
      const testConfig = await Config.create({
        model: { chat: 'chatModel', analysis: 'analysisModel' },
      });
      const testJournal = await Journal.create({
        title: 'Test Journal',
        user: testUser.id,
        config: testConfig.id
      });
  
      await AccessServices.deleteAccount(testJournal.id);
  
      const deletedJournal = await Journal.findById(testJournal.id);
      const deletedUser = await User.findById(testUser.id);
      const deletedConfig = await Config.findById(testConfig.id);
  
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
  
      const { newUser, newJournal } = await AccessServices.createAccount(fname, lname, email, password, journalTitle);
  
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
    
    it('should verify a user\'s email when a valid token is provided', async () => {
      const token = testUser.generateEmailVerificationToken();
      await testUser.save();
  
      const verifiedUser = await AccessServices.verifyEmail(token);
  
      const updatedUser = await User.findById(testUser.id);
      expect(updatedUser?.emailVerified).toBe(true);
      expect(updatedUser?.verifyEmailToken).toBeUndefined();
      expect(updatedUser?.verifyEmailTokenExpires).toBeUndefined();
      expect(verifiedUser.id).toBe(testUser.id);
    });
  
    it('should throw an error if the token is invalid', async () => {
      testUser.generateEmailVerificationToken();
      await testUser.save();
  
      const invalidToken = 'invalid-token';
      await expect(AccessServices.verifyEmail(invalidToken)).rejects.toThrow(
        'Email verification token is invalid.'
      );
    });
  
    it('should throw an error if no matching user is found for the token', async () => {
      const randomToken = 'random-token';
      await expect(AccessServices.verifyEmail(randomToken)).rejects.toThrow(
        'Email verification token is invalid.'
      );
    });
  
    it('should send a beta access email if the user is in beta phase and does not already have beta access', async () => {
      const ORIGINAL_RELEASE_PHASE = process.env.RELEASE_PHASE;
      process.env.RELEASE_PHASE = 'beta';
      const token = testUser.generateEmailVerificationToken();
      await testUser.save();
  
      await AccessServices.verifyEmail(token);
        
      expect(mockSendBetaRequestEmail).toHaveBeenCalledTimes(1);
      process.env.RELEASE_PHASE = ORIGINAL_RELEASE_PHASE;
    });
  
    it('should not send a beta access email if the user already has beta access', async () => {
      const ORIGINAL_RELEASE_PHASE = process.env.RELEASE_PHASE;
      process.env.RELEASE_PHASE = 'beta';
  
      const token = testUser.generateEmailVerificationToken();
      testUser.betaAccess = true;
      await testUser.save();
  
      await AccessServices.verifyEmail(token);
  
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

      const token = testUser.generatePasswordResetToken();
      await testUser.save();
  
      await AccessServices.resetPassword(token, 'newPassword123');
  
      const updatedUser = await User.findById(testUser.id);
      expect(testUser.setPassword).toHaveBeenCalledWith('newPassword123');
      expect(updatedUser?.resetPasswordToken).toBeUndefined();
      expect(updatedUser?.resetPasswordExpires).toBeUndefined();
  
      expect(testUser.sendPasswordResetConfirmationEmail).toHaveBeenCalled();
    });
  
    it('should throw an error if the token is invalid', async () => {
      testUser.generatePasswordResetToken();
      await testUser.save();
  
      const invalidToken = 'invalid-token';
      await expect(AccessServices.resetPassword(invalidToken, 'newPassword123')).rejects.toThrow(
        'Password reset token is invalid or has expired.'
      );
    });
  
    it('should throw an error if the token has expired', async () => {
      const token = testUser.generatePasswordResetToken();
      testUser.resetPasswordExpires = new Date(Date.now() - 3600000);
      await testUser.save();
  
      await expect(AccessServices.resetPassword(token, 'newPassword123')).rejects.toThrow(
        'Password reset token is invalid or has expired.'
      );
    });
  
    it('should ensure the resetPasswordToken and resetPasswordExpires fields are cleared after a successful reset', async () => {
      const token = testUser.generatePasswordResetToken();
      await testUser.save();
  
      await AccessServices.resetPassword(token, 'newPassword123');
  
      const updatedUser = await User.findById(testUser.id);
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
      
      const token = testUser.generatePasswordResetToken();
      await testUser.save();

      await AccessServices.resetPassword(token, 'newPassword123');
  
      expect(mockSendPasswordResetConfirmationEmail).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should generate and send a password reset email for a valid user', async () => {
      const mockSendPasswordResetEmail = jest.fn();
      jest.spyOn(User.prototype, 'sendPasswordResetEmail')
        .mockImplementation(mockSendPasswordResetEmail);
      testUser.betaAccess = true;
      await testUser.save();
  
      await AccessServices.forgotPassword(testUser.email);
  
      const updatedUser = await User.findById(testUser.id);
      expect(updatedUser).toBeTruthy();
      expect(updatedUser?.resetPasswordToken).toBeDefined();
      expect(updatedUser?.resetPasswordExpires?.getTime()).toBeGreaterThan(new Date().getTime());
      expect(mockSendPasswordResetEmail).toHaveBeenCalled();
    });
  
    it('should throw an error if the user is not found', async () => {
      await expect(AccessServices.forgotPassword('nonexistent@example.com')).rejects.toThrow(
        'Could not send recovery email.'
      );
    });
  
    it('should throw an error if the user is in beta and has no beta access', async () => {
      const mockSendAlertForForgotPasswordAbuse = jest.fn();
      jest.spyOn(User.prototype, 'sendAlertForForgotPasswordAbuse')
        .mockImplementation(mockSendAlertForForgotPasswordAbuse);
      testUser.betaAccess = false;
      testUser.betaAccessTokenExpires = new Date(0);
      await testUser.save();
      
      const ORIGINAL_RELEASE_PHASE = process.env.RELEASE_PHASE;
      process.env.RELEASE_PHASE = 'beta';
  
      await expect(AccessServices.forgotPassword(testUser.email)).rejects.toThrow(
        'You do not have beta access. Admin has been flagged.'
      );

      const updatedUser = await User.findById(testUser.id);
      expect(updatedUser?.betaAccess).toBe(false);

      process.env.RELEASE_PHASE = ORIGINAL_RELEASE_PHASE;
    });
  
    it('should throw an error if there is an issue generating or sending the email', async () => {
      jest.spyOn(User.prototype, 'sendPasswordResetEmail').mockRejectedValue(new Error('Email error'));
      testUser.betaAccess = true;
      await testUser.save();
  
      await expect(AccessServices.forgotPassword(testUser.email)).rejects.toThrow(
        'An error occurred while attempting to generate a recovery email.'
      );
    });
  });

  describe('ensureJournalExists (Integration Tests)', () => {
    it('should return an existing journal if one exists for the user', async () => {
      const testJournal = new Journal({ user: testUser.id });
      await testJournal.save();
  
      const result = await AccessServices.ensureJournalExists(testUser.id);
  
      expect(result.id).toEqual(testJournal.id);
      expect(result.user.toString()).toEqual(testUser.id);
    });
  
    it('should create a new journal and config if none exists for the user', async () => {
      const result = await AccessServices.ensureJournalExists(testUser.id);
  
      expect(result.user.toString()).toEqual(testUser.id);
      expect(result.config).toBeDefined();
  
      const savedConfig = await Config.findById(result.config);
      expect(savedConfig).not.toBeNull();
      expect(savedConfig?.model.analysis).toEqual('gpt-3.5-turbo-1106');
      expect(savedConfig?.model.chat).toEqual('gpt-4');
    });
  
    it('should handle multiple calls gracefully by reusing the existing journal', async () => {
      const firstCall = await AccessServices.ensureJournalExists(testUser.id);
      const secondCall = await AccessServices.ensureJournalExists(testUser.id);
  
      expect(firstCall.id).toEqual(secondCall.id);
  
      const journalCount = await Journal.countDocuments({ user: testUser.id });
      const configCount = await Config.countDocuments({});
      expect(journalCount).toBe(1);
      expect(configCount).toBe(1);
    });
  });
});