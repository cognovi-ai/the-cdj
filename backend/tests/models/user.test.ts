/**
 * @jest-environment node
 */

import nodemailer, { createTransport, Transport, Transporter } from 'nodemailer';
import { Entry, EntryAnalysis, User } from '../../src/models/index.js';

jest.mock('nodemailer');

const mockedNodemailer = jest.mocked(nodemailer);

describe('User model tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates email, password, and remember fields', () => {

  });

  it('validates registration schema', () => {

  });

  it('validates password schema', () => {

  });

  it('validates account schema', () => {

  });

  it('checks a submitted password against stored one', () => {

  });

  it('checks a submitted email against stored one', () => {

  });

  it('generates a password reset token, sets the resetPasswordToken field, and sets expiry time', () => {

  });

  it('generates an email verification token, sets the verifyEmailToken field, and sets expiry time', () => {

  });

  it('generates an beta access token, sets the betaAccessToken field, and sets expiry time', () => {

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