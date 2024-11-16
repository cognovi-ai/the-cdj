import * as AccountServices from '../../../src/models/services/account.js';
import { Config, Journal, User } from '../../../src/models/index.js';
import mongoose, { HydratedDocument } from 'mongoose';
import { UserType } from '../../../src/models/user.js';
import connectDB from '../../../src/db.js';

describe('Account services tests', () => {
  let mockUser: HydratedDocument<UserType>;

  beforeAll(async () => {
    await connectDB('cdj');
  });

  beforeEach(async () => {
    mockUser = await User.create({
      fname: 'test fname',
      lname: 'test lname',
      email: 'testemail@fake.com',
    });
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
});