import { Schema, model } from 'mongoose';

import Joi from 'joi';

import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import passportLocalMongoose from 'passport-local-mongoose';

if (process.env.NODE_ENV !== 'production') dotenv.config();

const userSchema = new Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  resetPasswordToken: { type: String, default: undefined },
  resetPasswordExpires: { type: Date, default: undefined }
});

// Utility functions
// Utility function for first name and last name validation
const createNameValidation = (isRequired = false) => {
  const validator = Joi.string()
    .alphanum()
    .min(1)
    .max(50)
    .messages({
      'string.alphanum': 'Name must contain only alphanumeric characters.',
      'string.min': 'Name must be at least 1 character long.',
      'string.max': 'Name must be less than or equal to 50 characters long.'
    });
  return isRequired ? validator.required() : validator;
};

// Utility function for email validation
const createEmailValidation = (isRequired = false) => {
  const validator = Joi.string()
    .email({ tlds: { allow: ['com', 'net', 'org', 'edu', 'gov', 'io', 'tech', 'uk', 'de', 'in'] } })
    .max(100)
    .lowercase()
    .messages({
      'string.email': 'Please provide a valid email address.',
      'string.max': 'Email must be less than or equal to 100 characters long.'
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
      'string.pattern.base': 'Password must contain only alphanumeric characters, underscores, and exclamation points.'
    });
  return isRequired ? validator.required() : validator;
};

// Common validation schema for both chat and analysis
const modelFieldValidation = Joi.string()
  .pattern(/^[a-zA-Z0-9-.]+$/) // Allow alphanumerics, hyphens, and periods
  .allow('')
  .max(50)
  .messages({
    'string.pattern.base': 'Field must only contain alphanumeric characters, hyphens, and periods.'
  });

// Validation schemas
// Base Joi validation schema
userSchema.statics.baseJoi = Joi.object({
  email: createEmailValidation(true),
  password: createPasswordValidation(true),
  remember: Joi.boolean()
});

// Registration Joi validation schema
userSchema.statics.registrationJoi = userSchema.statics.baseJoi.keys({
  fname: createNameValidation(true),
  lname: createNameValidation(true)
});

// New password Joi validation schema
userSchema.statics.passwordJoi = Joi.object({
  newPassword: createPasswordValidation(true)
});

// Account Joi validation schema (fields are not required here)
userSchema.statics.accountJoi = Joi.object({
  fname: createNameValidation(),
  lname: createNameValidation(),
  email: createEmailValidation(),
  oldPassword: createPasswordValidation(),
  newPassword: createPasswordValidation(),
  model: Joi.object({
    chat: modelFieldValidation,
    analysis: modelFieldValidation
  }),
  apiKey: Joi.string()
    .pattern(/^[a-zA-Z0-9-]{0,128}$/)
    .allow('')
    .messages({
      'string.pattern.base': 'API key must be between 30 and 128 characters long and contain only alphanumeric characters and dashes.'
    })
  // Add other fields as necessary
});

// Mongoose schema indices and plugins
// Assuming users will often be queried by email and it must be unique.
userSchema.index({ email: 1 }, { unique: true, background: true });

// Useful if searching by full name is common.
userSchema.index({ fname: 1, lname: 1 });

// Add passport-local-mongoose to User schema.
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  errorMessages: {
    IncorrectPasswordError: 'Incorrect login credentials.',
    IncorrectUsernameError: 'Incorrect login credentials.',
    MissingUsernameError: 'No email was given.',
    UserExistsError: 'The email address provided cannot be used.'
  }
});

// Compare passwords for re-authentication
userSchema.methods.comparePassword = function (candidatePassword) {
  return new Promise((resolve, reject) => {
    this.authenticate(candidatePassword, (err, user, passwordError) => {
      if (err) return reject(err);
      if (user) return resolve(true);
      return resolve(false);
    });
  });
};

// Check if there is a user with the given email
userSchema.statics.checkEmail = function (email) {
  return new Promise((resolve, reject) => {
    this.findByUsername(email, (err, user) => {
      if (err) return reject(err);
      if (user) return resolve(true);
      return resolve(false);
    });
  });
};

// Generate a password reset token
userSchema.methods.generatePasswordResetToken = function () {
  // Generate a token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash the token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set an expiry time of 10 minutes
  this.resetPasswordExpires = Date.now() + 600000;

  return resetToken;
};

userSchema.methods.sendPasswordResetEmail = async function (token) {
  // Configure your SMTP transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // TODO: Change this to the actual URL of the frontend app when deployed
  // Construct the password reset URL
  const resetUrl = `http://192.168.50.157:5173/reset-password?token=${ token }`;

  // Email content
  const message = {
    from: `"The CDJ" <${ process.env.SMTP_USER }>`, // Sender address
    to: this.email, // Recipient address (user's email)
    subject: 'Password Reset Request',
    text: `You are receiving this email because you (or someone else) have requested the password be reset for your account.\n\nPlease click on the following link, or paste it into your browser to complete the process:\n\n${ resetUrl }\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`
  };

  // Send the email
  await transporter.sendMail(message);
};

userSchema.methods.sendPasswordResetConfirmationEmail = async function () {
  // Configure your SMTP transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Email content
  const message = {
    from: `"The CDJ" <${ process.env.SMTP_USER }>`, // Sender address
    to: this.email, // Recipient address (user's email)
    subject: 'Password Reset Confirmation',
    text: 'Your password has been successfully reset.\n'
  };

  // Send the email
  await transporter.sendMail(message);
};

// Set new updated_at timestamp before saving.
userSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

export default model('User', userSchema);
