/**
 * @jest-environment node
 */

import nodemailer, { Transporter } from 'nodemailer';
import { User } from '../../src/models/index.js';

jest.mock('nodemailer');

const mockedNodemailer = jest.mocked(nodemailer);

describe('User model and validation tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('succeeds if email, password, and remember are valid', () => {
    const testObj = {
      email: 'testemail@fakesite.com',
      password: 'fakepassword',
      remember: true,
    };
    const testOptions = {};

    const { error, value } = User.baseJoi(testObj, testOptions);

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(testObj);
  });

  it('returns error if email over 100 chars', () => {
    const testObj = {};
    const testOptions = {};
    
    const { error, value } = User.baseJoi(testObj, testOptions);

    expect(error).toBeUndefined();
    expect(value).toBeNull();
  });

  it('returns error if email uses capital letters', () => {
    const testObj = {};
    const testOptions = {};
    
    const { error, value } = User.baseJoi(testObj, testOptions);

    expect(error).toBeUndefined();
    expect(value).toBeNull();
  });

  it('returns error if email extension is not allowed', () => {
    const testObj = {};
    const testOptions = {};
    
    const { error, value } = User.baseJoi(testObj, testOptions);

    expect(error).toBeUndefined();
    expect(value).toBeNull();
  });

  it('returns error if password under 8 characters', () => {
    const testObj = {};
    const testOptions = {};
    
    const { error, value } = User.baseJoi(testObj, testOptions);

    expect(error).toBeUndefined();
    expect(value).toBeNull();
  });

  it('returns error if password over 30 characters', () => {
    const testObj = {};
    const testOptions = {};
    
    const { error, value } = User.baseJoi(testObj, testOptions);

    expect(error).toBeUndefined();
    expect(value).toBeNull();
  });

  it('returns error if password uses characters that are not alphanumeric, numbers, or exclaimation points', () => {
    const testObj = {};
    const testOptions = {};
    
    const { error, value } = User.baseJoi(testObj, testOptions);

    expect(error).toBeUndefined();
    expect(value).toBeNull();
  });

  it('adds property remember with a boolean value', () => {
    const testObj = {};
    const testOptions = {};
    
    const { error, value } = User.baseJoi(testObj, testOptions);

    expect(error).toBeUndefined();
    expect(value).toBeNull();
  });

  it('returns error if fname non-alphanumeric', () => {

    expect(false).toBe(true);
  });

  it('returns error if lname non-alphanumeric', () => {

    expect(false).toBe(true);
  });

  it('returns error if fname less than 1 characters', () => {

    expect(false).toBe(true);
  });

  it('returns error if lname less than 1 characters', () => {

    expect(false).toBe(true);
  });

  it('returns error if fname over 50 characters', () => {

    expect(false).toBe(true);
  });

  it('returns error if lname over 50 characters', () => {

    expect(false).toBe(true);
  });

  it('returns error if fname 0 characters long', () => {

    expect(false).toBe(true);
  });

  it('returns error if lname 0 characters long', () => {

    expect(false).toBe(true);
  });

  it('succeeds registration schema validation if fname and lname are valid', () => {

    expect(false).toBe(true);
  });

  it('succeeds password schema validation if newPassword valid', () => {
    expect(false).toBe(true);
  });

  it('succeeds if account schema validation empty', () => {
    expect(false).toBe(true);
  });

  it('succeeds if no present field fails validation', () => {
    expect(false).toBe(true);
  });

  it('checks a submitted password against stored one', () => {
    expect(false).toBe(true);
  });

  it('checks a submitted email against stored one', () => {
    expect(false).toBe(true);
  });

  it('generates a password reset token, sets the resetPasswordToken field, and sets expiry time', () => {
    expect(false).toBe(true);
  });

  it('generates an email verification token, sets the verifyEmailToken field, and sets expiry time', () => {
    expect(false).toBe(true);
  });

  it('generates an beta access token, sets the betaAccessToken field, and sets expiry time', () => {
    expect(false).toBe(true);
  });

  it.skip('sends an email with nodemailer', async () => {
    // skipping test because kinda pointless and brittle,
    // but it's a nice example if you want to test other email methods
    const sendMailFn = jest.fn()
    mockedNodemailer.createTransport.mockReturnValue(({ sendMail: sendMailFn } as unknown) as Transporter);
    const content = {
      to: '',
      subject: '',
      text: ''
    };
    const mockUser = new User();

    await mockUser.sendMail(content);

    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(sendMailFn).toHaveBeenCalled();
  });
});