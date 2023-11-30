import { Schema, model } from 'mongoose';

import Joi from 'joi';

import passportLocalMongoose from 'passport-local-mongoose';

// User schema definition for MongoDB
const userSchema = new Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
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
      'string.pattern.base': 'Password must contain only alphanumeric characters and special characters.'
    });
  return isRequired ? validator.required() : validator;
};

// Validation schemas
// Base Joi validation schema
userSchema.statics.baseJoi = Joi.object({
  email: createEmailValidation(true),
  password: createPasswordValidation(true)
});

// Registration Joi validation schema
userSchema.statics.registrationJoi = userSchema.statics.baseJoi.keys({
  fname: createNameValidation(true),
  lname: createNameValidation(true)
});

// Account Joi validation schema (fields are not required here)
userSchema.statics.accountJoi = Joi.object({
  fname: createNameValidation(),
  lname: createNameValidation(),
  email: createEmailValidation(),
  oldPassword: createPasswordValidation(),
  newPassword: createPasswordValidation(),
  model: Joi.string()
    .pattern(/^[a-zA-Z0-9.-]{5,30}$/)
    .messages({
      'string.pattern.base': 'Model must be between 5 and 30 characters and contain only alphanumeric characters, periods, and dashes.'
    }),
  apiKey: Joi.string()
    .pattern(/^[a-zA-Z0-9-]{30,128}$/)
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
    IncorrectPasswordError: 'Incorrect login credentials',
    IncorrectUsernameError: 'Incorrect login credentials',
    MissingUsernameError: 'No email was given',
    UserExistsError: 'Email already in use'
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

// Set new updated_at timestamp before saving.
userSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

export default model('User', userSchema);
