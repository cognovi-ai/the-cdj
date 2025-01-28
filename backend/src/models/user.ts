import {
  Document,
  PassportLocalDocument,
  PassportLocalModel,
  PassportLocalSchema,
  Schema,
  model
} from 'mongoose';

import Joi from 'joi';

import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import passportLocalMongoose from 'passport-local-mongoose';

if (process.env.NODE_ENV !== 'production') dotenv.config();

export interface UserType extends PassportLocalDocument {
  fname: string,
  lname: string,
  email: string,
  created_at?: Date,
  updated_at?: Date,
  resetPasswordToken?: string,
  resetPasswordExpires?: Date,
  verifyEmailToken?: string,
  verifyEmailTokenExpires?: Date,
  emailVerified?: boolean,
  betaAccessToken?: string,
  betaAccessTokenExpires?: Date,
  betaAccess?: boolean,

  // Instance Methods
  comparePassword(candidatePassword: string): Promise<unknown>,
  generatePasswordResetToken(): string,
  generateEmailVerificationToken(): string,
  generateBetaAccessToken(): string,
  sendMail(content: MailContent): Promise<void>,
  sendPasswordResetEmail(token: string): Promise<void>,
  sendPasswordResetConfirmationEmail(): Promise<void>,
  sendBetaAccessVerificationEmail(token: string): Promise<void>,
  sendBetaRequestEmail(token: string): Promise<void>,
  sendBetaApprovalEmail(token: string): Promise<void>,
  sendBetaDenialEmail(): Promise<void>,
  sendAlertForForgotPasswordAbuse(token: string): Promise<void>,
}

interface MailContent {
  to: string,
  subject: string,
  text: string,
}

interface UserModel<T extends Document> extends PassportLocalModel<T> {
  baseJoi(obj: unknown, options?: object): Joi.ValidationResult,
  registrationJoi(obj: unknown, options?: object): Joi.ValidationResult,
  passwordJoi(obj: unknown, options?: object): Joi.ValidationResult,
  accountJoi(obj: unknown, options?: object): Joi.ValidationResult,
  checkEmail(email: string): Promise<boolean>,
}

const userSchema = new Schema<UserType, UserModel<UserType>>({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  resetPasswordToken: { type: String, default: undefined },
  resetPasswordExpires: { type: Date, default: undefined },
  verifyEmailToken: { type: String, default: undefined },
  verifyEmailTokenExpires: { type: Date, default: undefined },
  emailVerified: { type: Boolean, default: false },
  betaAccessToken: { type: String, default: undefined },
  betaAccessTokenExpires: { type: Date, default: undefined },
  betaAccess: { type: Boolean, default: undefined },
}) as PassportLocalSchema<UserType, UserModel<UserType>>;

// Add passport-local-mongoose to User schema.
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  errorMessages: {
    IncorrectPasswordError: 'Incorrect login credentials.',
    IncorrectUsernameError: 'Incorrect login credentials.',
    MissingUsernameError: 'No email was given.',
    UserExistsError: 'The email address provided cannot be used.',
  },
});

// Utility functions
// Utility function for first name and last name validation
const createNameValidation = (isRequired = false) => {
  const validator = Joi.string().alphanum().min(1).max(50).messages({
    'string.alphanum': 'Name must contain only alphanumeric characters.',
    'string.min': 'Name must be at least 1 character long.',
    'string.max': 'Name must be less than or equal to 50 characters long.',
  });
  return isRequired ? validator.required() : validator;
};

// Utility function for email validation
const createEmailValidation = (isRequired = false) => {
  const validator = Joi.string()
    .email({
      tlds: {
        allow: [
          'com',
          'net',
          'org',
          'edu',
          'gov',
          'io',
          'app',
          'ai',
          'tech',
          'uk',
          'de',
          'in',
        ],
      },
    })
    .max(100)
    .lowercase()
    .messages({
      'string.email': 'Please provide a valid email address.',
      'string.max': 'Email must be less than or equal to 100 characters long.',
    });
  return isRequired ? validator.required() : validator;
};

// Utility function for password validation
const createPasswordValidation = (isRequired = false) => {
  const validator = Joi.string()
    .min(8)
    .pattern(/^[a-zA-Z0-9_!]{8,30}$/)
    .messages({
      'string.min': 'Password must be at least 8 characters long.',
      'string.pattern.base':
        'Password must contain only alphanumeric characters, underscores, and exclamation points.',
    });
  return isRequired ? validator.required() : validator;
};

const baseUserJoiSchema = Joi.object({
  email: createEmailValidation(true),
  password: createPasswordValidation(true),
  remember: Joi.boolean(),
});

// Validation schemas
// Base Joi validation schema
userSchema.statics.baseJoi = function (obj: unknown, options?: object): Joi.ValidationResult {
  return baseUserJoiSchema.validate(obj, options);
};

// Registration Joi validation schema
userSchema.statics.registrationJoi = function (obj: unknown, options?: object): Joi.ValidationResult {
  const registrationJoiSchema = baseUserJoiSchema.keys({
    fname: createNameValidation(true),
    lname: createNameValidation(true),
  });
  return registrationJoiSchema.validate(obj, options);
};

// New password Joi validation schema
userSchema.statics.passwordJoi = function (obj: unknown, options?: object): Joi.ValidationResult {
  const passwordJoiSchema = Joi.object({
    newPassword: createPasswordValidation(true),
  });
  return passwordJoiSchema.validate(obj, options);
};

// Account Joi validation schema (fields are not required here)
userSchema.statics.accountJoi = function (obj: unknown, options?: object): Joi.ValidationResult {
  const accountJoiSchema = Joi.object({
    fname: createNameValidation(),
    lname: createNameValidation(),
    email: createEmailValidation(),
    oldPassword: createPasswordValidation(),
    newPassword: createPasswordValidation(),
  });
  return accountJoiSchema.validate(obj, options);
};

// Mongoose schema indices and plugins
// Assuming users will often be queried by email and it must be unique.
userSchema.index({ email: 1 }, { unique: true, background: true });

// Useful if searching by full name is common.
userSchema.index({ fname: 1, lname: 1 });

// Mongoose middleware
// Set new updated_at timestamp before saving.
userSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

// User schema methods and statics
// Compare passwords for re-authentication
userSchema.methods.comparePassword = function (candidatePassword: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    this.authenticate(candidatePassword, (err: unknown, user: unknown) => {
      if (err) return reject(err);
      if (user) return resolve(true);
      return resolve(false);
    });
  });
};

// Check if there is a user with the given email
userSchema.statics.checkEmail = function (email: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    this.findByUsername(email, false, (err: unknown, user: unknown) => {
      if (err) return reject(err);
      if (user) return resolve(true);
      return resolve(false);
    });
  });
};

// Generate a password reset token
userSchema.methods.generatePasswordResetToken = function (): string {
  // Generate a token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash the token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set an expiry time of 10 minutes
  this.set({ resetPasswordExpires: Date.now() + 600000 });

  return resetToken;
};

// Generate an email confirmation token
userSchema.methods.generateEmailVerificationToken = function (): string {
  // Generate a token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash the token and set to confirmEmailToken field
  this.verifyEmailToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set an expiry time of 1 week
  this.set({ verifyEmailTokenExpires: Date.now() + 604800000 });

  return verificationToken;
};

// Generate a beta access token
userSchema.methods.generateBetaAccessToken = function (): string {
  // Generate a token
  const betaAccessToken = crypto.randomBytes(20).toString('hex');

  // Hash the token and set to betaAccessToken field
  this.betaAccessToken = crypto
    .createHash('sha256')
    .update(betaAccessToken)
    .digest('hex');

  // Set an expiry time of 1 week
  this.set({ betaAccessTokenExpires: Date.now() + 604800000 });

  return betaAccessToken;
};

// Utility function for sending emails
userSchema.methods.sendMail = async function (content: MailContent): Promise<void> {
  const { to, subject, text } = content;

  // Configure your SMTP transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Insert the email content
  const message = {
    from: `"${process.env.SMTP_NAME}" <${process.env.SYSTEM_INBOX}>`,
    to,
    subject,
    text,
  };

  // Send the email
  await transporter.sendMail(message);
};

// Send a password reset email
userSchema.methods.sendPasswordResetEmail = async function (token: string): Promise<void> {
  // Construct the password reset URL
  const resetUrl = `${process.env.TOKENIZED_URL}/reset-password?token=${token}`;

  // Recipient address (user's email)
  const to = this.email;
  const subject = 'Password Reset Request';
  const text = `Dear ${this.fname},\n\nYou are receiving this email because you (or someone else) have requested the password be reset for your account.\n\nPlease click on the following link, or paste it into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n\nSincerely,\n\nThe CDJ Team\n`;

  this.sendMail({ to, subject, text });
};

// Send a password reset confirmation email
userSchema.methods.sendPasswordResetConfirmationEmail = async function (): Promise<void> {
  // Recipient address (user's email)
  const to = this.email;
  const subject = 'Password Reset Confirmation';
  const text = `Dear ${this.fname},\n\nYour password has been successfully reset. You may now log in with this email address and your new password.\n\nSincerely,\n\nThe CDJ Team\n`;

  this.sendMail({ to, subject, text });
};

// Send beta request confirmation email
userSchema.methods.sendBetaAccessVerificationEmail = async function (token: string): Promise<void> {
  // Construct the verification URL
  const verificationUrl = `${process.env.TOKENIZED_URL}/verify-email?token=${token}`;

  // Recipient address (user's email)
  const to = this.email;
  const subject = 'Beta Access Email Verification';
  const text = `Dear ${this.fname},\n\nYou have requested beta access for The Cognitive Distortion Journal. After you verify your email address, you will receive an email when your request is reviewed with instructions. Thank you for your interest in the app!\n\nPlease click the link to verify your email address.\n\n${verificationUrl}\n\nSincerely,\n\nThe CDJ Team\n`;

  this.sendMail({ to, subject, text });
};

// Send beta request email to support
userSchema.methods.sendBetaRequestEmail = async function (token: string): Promise<void> {
  // Construct the approval and denial URLs
  const approvalUrl = `${process.env.DOMAIN}:${process.env.PORT}/access/beta-approval?token=${token}`;
  const denialUrl = `${process.env.DOMAIN}:${process.env.PORT}/access/beta-denial?token=${token}`;

  // Recipient address (support email)
  const to = process.env.SUPPORT_INBOX;
  const subject = 'User Request Beta Access';
  const text = `${this.fname} ${this.lname} <${this.email}> has requested beta access. Use the following tokenized links to approve or deny them.\n\nTo APPROVE ${this.fname} click: ${approvalUrl}\n\nTo DENY ${this.fname} click: ${denialUrl}\n\n${this.fname} ${this.lname} will be notified of your decision.`;

  this.sendMail({ to, subject, text });
};

// Send beta approval email
userSchema.methods.sendBetaApprovalEmail = async function (token: string): Promise<void> {
  // Construct the password reset URL
  const passwordResetUrl = `${process.env.TOKENIZED_URL}/reset-password?token=${token}`;

  // Recipient address (user's email)
  const to = this.email;
  const subject = 'Beta Access Approved';
  const text = `Dear ${this.fname},\n\nYour request for beta access has been approved. Please click the following link to complete your registration. You will be prompted to set a password for your account.\n\n${passwordResetUrl}\n\nSincerely,\n\nThe CDJ Team\n`;

  this.sendMail({ to, subject, text });
};

// Send beta denial email
userSchema.methods.sendBetaDenialEmail = async function (): Promise<void> {
  // Recipient address (user's email)
  if (this.betaAccessTokenExpires === undefined) { // TODO: probably want to change default rather than have this case
    this.betaAccessTokenExpires = new Date(Date.now() + 604800000);
  }
  const to = this.email;
  const subject = 'Beta Access Denied';
  const text = `Dear ${this.fname
  },\n\nAfter reviewing your request for beta access, we have decided to deny your request. There may be a number of reasons why we made this decision such as the beta period ending soon or we have reached our maximum number of beta users. Whatever the case, you may apply again after ${this.betaAccessTokenExpires.toLocaleDateString()}. Thank you for your interest in the app! We hope you will consider applying again after the specified date or using the app when it is released.\n\nSincerely,\n\nThe CDJ Team\n`;

  this.sendMail({ to, subject, text });
};

// Send admin alert for forgot password abuse
userSchema.methods.sendAlertForForgotPasswordAbuse = async function (token: string): Promise<void> {
  // Construct the approval and denial URLs
  const approvalUrl = `${process.env.DOMAIN}:${process.env.PORT}/access/beta-approval?token=${token}`;
  const denialUrl = `${process.env.DOMAIN}:${process.env.PORT}/access/beta-denial?token=${token}`;

  // Recipient address (support email)
  const to = process.env.ADMIN_INBOX;
  const subject = 'ALERT: User Forgot Password Abuse';
  const text = `${this.fname} ${this.lname} <${this.email}> has attempted to abuse the forgot password feature. This can happen when a user is trying to gain access to an account that is not theirs or they are trying to gain access in a closed ${process.env.RELEASE_PHASE} release.\n\nIf in a closed release, use the following tokenized links to deny or approve them.\n\nTo DENY ${this.fname} click: ${denialUrl}\n\nTo APPROVE ${this.fname} click: ${approvalUrl}\n\n${this.fname} ${this.lname} will be notified of your decision.`;

  this.sendMail({ to, subject, text });
};

export default model<UserType, UserModel<UserType>>('User', userSchema);
