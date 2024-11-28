import * as AccountServices from '../../../src/models/services/account.js';
import { Config, Journal, User } from '../../../src/models/index.js';
import connectDB from '../../../src/db.js';
import mongoose from 'mongoose';

describe('Account services tests', () => {

  beforeAll(async () => {
    await connectDB('cdj');
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('gets user and config without message for getAccount when config set', async () => {
    const mockUser = await User.create({
      fname: 'test fname',
      lname: 'test lname',
      email: 'testemail@fake.com',
    });
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
    const mockUser = await User.create({
      fname: 'test fname',
      lname: 'test lname',
      email: 'testemail@fake.com',
    });
    const mockJournal = await Journal.create({ user: mockUser.id });

    const { user, config, configMessage } = await AccountServices.getAccount(mockJournal.id);
    
    expect(user.id).toBe(mockUser.id);
    expect(config).toBe(config);
    expect(configMessage).toBe('Click the Config tab to complete your journal setup.');
  });

  it('throws error if journal not found', async () => {
    const mockUser = new User({
      fname: 'test fname',
      lname: 'test lname',
      email: 'testemail@fake.com',
    });
    const mockJournal = new Journal({ user: mockUser.id });
    await expect(
      AccountServices.getAccount(mockJournal.id)
    ).rejects.toThrow('Journal not found.');
  });

  it('throws error if user not found', async () => {
    const mockUser = new User({
      fname: 'test fname',
      lname: 'test lname',
      email: 'testemail@fake.com',
    });
    const mockJournal = await Journal.create({ user: mockUser.id });
    await expect(
      AccountServices.getAccount(mockJournal.id)
    ).rejects.toThrow('User not found.');
  });
});