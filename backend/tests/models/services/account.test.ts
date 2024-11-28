/*
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as AccountServices from '../../../src/models/services/account.js';
import { Config, Journal, User } from '../../../src/models/index.js';
import mongoose, { HydratedDocument } from 'mongoose';
import { ConfigType } from '../../../src/models/config.js';
import ExpressError from '../../../src/utils/ExpressError.js';
import { JournalType } from '../../../src/models/journal.js';
import { UserType } from '../../../src/models/user.js';
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
});