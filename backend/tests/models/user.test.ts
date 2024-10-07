/**
 * @jest-environment node
 */

import nodemailer, { Transporter } from 'nodemailer';
import { User } from '../../src/models/index.js';
import { UserType } from '../../src/models/user.js';
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

  const invalidEmails = [
    { desc: 'email over 100 chars', email: 'A'.repeat(101) + '@fakesite.com' },
    { desc: 'email uses capital letters', email: 'TestEmail@fakesite.com' },
    { desc: 'email extension is not allowed', email: 'testemail@fakesite.xyz' },
  ];

  it.each(invalidEmails)('returns error if %s', ({ email }) => {
    const testObj = { email };
    const testOptions = {};
    
    const { error } = User.baseJoi(testObj, testOptions);

    expect(error).toBeDefined();
  });

  const invalidPasswords = [
    { desc: 'password under 8 characters', password: 'short' },
    { desc: 'password over 30 characters', password: 'A'.repeat(31) },
    { desc: 'password uses invalid characters', password: 'Invalid$Password' },
  ];

  it.each(invalidPasswords)('returns error if $desc', ({ desc, password }) => {
    const testObj = { password };
    const testOptions = {};
    
    const { error } = User.baseJoi(testObj, testOptions);

    expect(error).not.toBeNull();
  });

  it('adds option abortEarly to log all validation errors', () => {
    const testObj = {
      email: 'invalid',
      password: 'short',
    };
    const testOptions = { abortEarly: false };
  
    const { error, value } = User.baseJoi(testObj, testOptions);
  
    expect(error).not.toBeNull();
    expect(error?.details.length).toBe(3);
    expect(value).toEqual(testObj);
  });

  const invalidFirstNames = [
    { desc: 'fname non-alphanumeric', fname: 'John@' },
    { desc: 'fname less than 1 character', fname: '' },
    { desc: 'fname over 50 characters', fname: 'A'.repeat(51) },
  ];

  const invalidLastNames = [
    { desc: 'lname non-alphanumeric', lname: 'Doe!' },
    { desc: 'lname less than 1 character', lname: '' },
    { desc: 'lname over 50 characters', lname: 'B'.repeat(51) },
  ];

  it.each(invalidFirstNames)('returns error if %s', ({ fname }) => {
    const testObj = { fname };
    const testOptions = {};
    
    const { error } = User.registrationJoi(testObj, testOptions);

    expect(error).not.toBeNull();
  });

  it.each(invalidLastNames)('returns error if %s', ({ lname }) => {
    const testObj = { lname };
    const testOptions = {};
    
    const { error } = User.registrationJoi(testObj, testOptions);

    expect(error).not.toBeNull();
  });

  it('succeeds registration schema validation if fname and lname are valid', () => {
    const validUser = {
      fname: 'John',
      lname: 'Doe',
      email: 'test@test.com',
      password: 'StrongP4ssw0rd!',
    };

    const testOptions = { abortEarly: false };
    const result = User.registrationJoi(validUser, testOptions);
    expect(result.error).toBeUndefined();
  });

  it('succeeds password schema validation if newPassword valid', () => {
    const validPassword = 'StrongP4ssw0rd!';
    const result = User.passwordJoi({ newPassword: validPassword });
    expect(result.error).toBeUndefined();
  });

  it('should validate successfully with all valid fields', () => {
    const validObj = {
      fname: 'John',
      lname: 'Doe',
      email: 'john.doe@example.com',
      oldPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      model: {
        chat: 'someChatModel',
        analysis: 'someAnalysisModel',
      },
    };

    const { error, value } = User.accountJoi(validObj);
    expect(error).toBeUndefined();
    expect(value).toEqual(validObj);
  });

  it('should fail validation with invalid fields', () => {
    const invalidObj = {
      fname: 'J',
      lname: 'Doe',
      email: 'invalid-email',
      oldPassword: 'short',
      newPassword: 'short',
      model: {
        chat: 'someChatModel',
        analysis: 'someAnalysisModel',
      },
    };

    const { error, value } = User.accountJoi(invalidObj);
    expect(error).toBeDefined();
    expect(value).toEqual(invalidObj);
  });

  it('should validate successfully with missing optional fields', () => {
    const partialObj = {
      fname: 'John',
      lname: 'Doe',
      email: 'john.doe@example.com',
    };

    const { error, value } = User.accountJoi(partialObj);
    expect(error).toBeUndefined();
    expect(value).toEqual(partialObj);
  });  

  it('compares passwords for re-authentication', async () => {
    const mockUser = new User({ password: 'correct_password' });
    jest.spyOn(mockUser, 'authenticate').mockImplementation((candidatePassword, callback) => {
      if (candidatePassword === 'correct_password') {
        return callback(null, mockUser, null);
      } else {
        return callback(null, null, 'Incorrect password');
      }
    });
  
    const result = await mockUser.comparePassword('correct_password');
    expect(result).toBe(true);
  
    const resultIncorrect = await mockUser.comparePassword('wrong_password');
    expect(resultIncorrect).toBe(false);
  });

  describe('checkEmail method', () => {
    let findByUsernameMock: jest.SpyInstance;

    afterEach(() => {
      findByUsernameMock.mockRestore();
    });

    it('should resolve true if a user with the given email exists', async () => {
      findByUsernameMock = jest.spyOn(User, 'findByUsername').mockImplementation((email, select, callback) => {
        callback(null, { email: 'testemail@fakesite.com' });
      });

      const result = await User.checkEmail('testemail@fakesite.com');
      expect(result).toBe(true);
      expect(findByUsernameMock).toHaveBeenCalledWith('testemail@fakesite.com', false, expect.any(Function));
    });

    it('should resolve false if no user with the given email exists', async () => {
      findByUsernameMock = jest.spyOn(User, 'findByUsername').mockImplementation((email, select, callback) => {
        callback(null, null);
      });

      const result = await User.checkEmail('nonexistentemail@fakesite.com');
      expect(result).toBe(false);
      expect(findByUsernameMock).toHaveBeenCalledWith('nonexistentemail@fakesite.com', false, expect.any(Function));
    });

    it('should reject if an error occurs during the search', async () => {
      findByUsernameMock = jest.spyOn(User, 'findByUsername').mockImplementation((email, select, callback) => {
        callback(new Error('Database error'), null);
      });

      await expect(User.checkEmail('error@fakesite.com')).rejects.toThrow('Database error');
      expect(findByUsernameMock).toHaveBeenCalledWith('error@fakesite.com', false, expect.any(Function));
    });
  });

  describe('Token generation methods', () => {
    it('generates a password reset token, sets the resetPasswordToken field, and sets expiry time', async () => {
      const user = new User({ email: 'test@example.com' });
      await user.generatePasswordResetToken();
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpires).toBeInstanceOf(Date);
    });

    it('generates an email verification token, sets the verifyEmailToken field, and sets expiry time', async () => {
      const user = new User({ email: 'test@example.com' });
      await user.generateEmailVerificationToken();
      expect(user.verifyEmailToken).toBeDefined();
      expect(user.verifyEmailTokenExpires).toBeInstanceOf(Date);
    });

    it('generates a beta access token, sets the betaAccessToken field, and sets expiry time', async () => {
      const user = new User({ email: 'test@example.com' });
      await user.generateBetaAccessToken();
      expect(user.betaAccessToken).toBeDefined();
      expect(user.betaAccessTokenExpires).toBeInstanceOf(Date);
    });
  });

  describe('Email sending methods', () => {
    let sendMailMock: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      sendMailMock = jest.fn().mockResolvedValue({});
    });
  
    it('sends an email with nodemailer', async () => {
      const sendMailFn = jest.fn();
      mockedNodemailer.createTransport.mockReturnValue(({ sendMail: sendMailFn } as unknown) as Transporter);
      const content = {
        from: '"The CDJ Team" <system@thecdj.app>',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'This is a test email.',
      };
      const mockUser = new User();
  
      await mockUser.sendMail(content);
  
      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(sendMailFn).toHaveBeenCalledWith(content);
    });
  
    const emailTests = [
      {
        method: async (user: UserType, token?: string | null | null) => {
          if (!token) throw new Error('Token is required');
          await user.sendPasswordResetEmail(token);
        },
        description: 'should send a password reset email with the correct parameters',
        envVars: { TOKENIZED_URL: 'http://localhost' },
        token: 'test-token',
        expectedContent: (user: UserType, token?: string | null) => {
          if (!token) throw new Error('Token is required in expectedContent');
          const resetUrl = `http://localhost/reset-password?token=${token}`;
          return {
            to: user.email,
            subject: 'Password Reset Request',
            text: `Dear ${user.fname},\n\nYou are receiving this email because you (or someone else) have requested the password be reset for your account.\n\nPlease click on the following link, or paste it into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n\nSincerely,\n\nThe CDJ Team\n`,
          };
        },
      },
      {
        method: async (user: UserType) => {
          await user.sendPasswordResetConfirmationEmail();
        },
        description: 'should send a password reset confirmation email with the correct parameters',
        envVars: {},
        token: null,
        expectedContent: (user: UserType) => ({
          to: user.email,
          subject: 'Password Reset Confirmation',
          text: `Dear ${user.fname},\n\nYour password has been successfully reset. You may now log in with this email address and your new password.\n\nSincerely,\n\nThe CDJ Team\n`,
        }),
      },
      {
        method: async (user: UserType, token?: string | null | null) => {
          if (!token) throw new Error('Token is required');
          await user.sendBetaAccessVerificationEmail(token);
        },
        description: 'should send a beta access verification email with the correct parameters',
        envVars: { TOKENIZED_URL: 'http://localhost' },
        token: 'test-token',
        expectedContent: (user: UserType, token?: string | null) => {
          if (!token) throw new Error('Token is required in expectedContent');
          const verificationUrl = `http://localhost/verify-email?token=${token}`;
          return {
            to: user.email,
            subject: 'Beta Access Email Verification',
            text: `Dear ${user.fname},\n\nYou have requested beta access for The Cognitive Distortion Journal. After you verify your email address, you will receive an email when your request is reviewed with instructions. Thank you for your interest in the app!\n\nPlease click the link to verify your email address.\n\n${verificationUrl}\n\nSincerely,\n\nThe CDJ Team\n`,
          };
        },
      },
      {
        method: async (user: UserType, token?: string | null | null) => {
          if (!token) throw new Error('Token is required');
          await user.sendBetaRequestEmail(token);
        },
        description: 'should send a beta request email with the correct parameters',
        envVars: {
          DOMAIN: 'http://localhost',
          PORT: '3000',
          SUPPORT_INBOX: 'support@example.com',
        },
        token: 'test-token',
        expectedContent: (user: UserType, token?: string | null) => {
          if (!token) throw new Error('Token is required in expectedContent');
          const approvalUrl = `http://localhost:3000/access/beta-approval?token=${token}`;
          const denialUrl = `http://localhost:3000/access/beta-denial?token=${token}`;
          return {
            to: process.env.SUPPORT_INBOX,
            subject: 'User Request Beta Access',
            text: `${user.fname} ${user.lname} <${user.email}> has requested beta access. Use the following tokenized links to approve or deny them.\n\nTo APPROVE ${user.fname} click: ${approvalUrl}\n\nTo DENY ${user.fname} click: ${denialUrl}\n\n${user.fname} ${user.lname} will be notified of your decision.`,
          };
        },
      },
      {
        method: async (user: UserType, token?: string | null | null) => {
          if (!token) throw new Error('Token is required');
          await user.sendBetaApprovalEmail(token);
        },
        description: 'should send a beta approval email with the correct parameters',
        envVars: { TOKENIZED_URL: 'http://localhost' },
        token: 'test-token',
        expectedContent: (user: UserType, token?: string | null) => {
          if (!token) throw new Error('Token is required in expectedContent');
          const passwordResetUrl = `http://localhost/reset-password?token=${token}`;
          return {
            to: user.email,
            subject: 'Beta Access Approved',
            text: `Dear ${user.fname},\n\nYour request for beta access has been approved. Please click the following link to complete your registration. You will be prompted to set a password for your account.\n\n${passwordResetUrl}\n\nSincerely,\n\nThe CDJ Team\n`,
          };
        },
      },
      {
        method: async (user: UserType) => {
          await user.sendBetaDenialEmail();
        },
        description: 'should send a beta denial email with the correct parameters',
        envVars: {},
        token: null,
        expectedContent: (user: UserType) => {
          const expectedExpirationDate = new Date(Date.now() + 604800000).toLocaleDateString();
          return {
            to: user.email,
            subject: 'Beta Access Denied',
            text: `Dear ${user.fname},\n\nAfter reviewing your request for beta access, we have decided to deny your request. There may be a number of reasons why we made this decision such as the beta period ending soon or we have reached our maximum number of beta users. Whatever the case, you may apply again after ${expectedExpirationDate}. Thank you for your interest in the app! We hope you will consider applying again after the specified date or using the app when it is released.\n\nSincerely,\n\nThe CDJ Team\n`,
          };
        },
      },
      {
        method: async (user: UserType, token?: string | null | null) => {
          if (!token) throw new Error('Token is required');
          await user.sendAlertForForgotPasswordAbuse(token);
        },
        description: 'should send an alert email with the correct parameters',
        envVars: {
          DOMAIN: 'http://localhost',
          PORT: '3000',
          ADMIN_INBOX: 'admin@example.com',
          RELEASE_PHASE: 'beta',
        },
        token: 'test-token',
        expectedContent: (user: UserType, token?: string | null) => {
          if (!token) throw new Error('Token is required in expectedContent');
          const approvalUrl = `http://localhost:3000/access/beta-approval?token=${token}`;
          const denialUrl = `http://localhost:3000/access/beta-denial?token=${token}`;
          return {
            to: process.env.ADMIN_INBOX,
            subject: 'ALERT: User Forgot Password Abuse',
            text: `${user.fname} ${user.lname} <${user.email}> has attempted to abuse the forgot password feature. This can happen when a user is trying to gain access to an account that is not theirs or they are trying to gain access in a closed beta release.\n\nIf in a closed release, use the following tokenized links to deny or approve them.\n\nTo DENY ${user.fname} click: ${denialUrl}\n\nTo APPROVE ${user.fname} click: ${approvalUrl}\n\n${user.fname} ${user.lname} will be notified of your decision.`,
          };
        },
      },
    ];
  
    emailTests.forEach(({ method, description, envVars, token, expectedContent }) => {
      it(description, async () => {
        // Mock environment variables
        for (const [key, value] of Object.entries(envVars)) {
          process.env[key] = value;
        }
  
        const user = new User({
          fname: 'John',
          lname: 'Doe',
          email: 'john.doe@example.com',
        });
  
        user.sendMail = sendMailMock;
  
        await method(user, token);
  
        const expectedEmailContent = expectedContent(user, token);
  
        expect(sendMailMock).toHaveBeenCalledTimes(1);
        expect(sendMailMock).toHaveBeenCalledWith(expectedEmailContent);
      });
    });
  });
});  