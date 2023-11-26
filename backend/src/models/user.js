import { Schema, model } from 'mongoose'

import Joi from 'joi'

import passportLocalMongoose from 'passport-local-mongoose'

const userSchema = new Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
})

userSchema.statics.baseJoi = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: ['com', 'net', 'org', 'edu', 'gov', 'io', 'tech', 'uk', 'de', 'in'] } })
    .max(100)
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address.',
      'string.max': 'Email must be less than or equal to 100 characters long.'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^[a-zA-Z0-9_!]{8,30}$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long.',
      'string.pattern.base': 'Password must be between 8 and 30 characters and contain only alphanumeric characters (letters and numbers).'
    })
})

userSchema.statics.registrationJoi = userSchema.statics.baseJoi.keys({
  fname: Joi.string()
    .alphanum()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.alphanum': 'First name must contain only alphanumeric characters.',
      'string.min': 'First name must be at least 1 characters long.',
      'string.max': 'First name must be less than or equal to 50 characters long.'
    }),
  lname: Joi.string()
    .alphanum()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.alphanum': 'Last name must contain only alphanumeric characters.',
      'string.min': 'Last name must be at least 1 characters long.',
      'string.max': 'Last name must be less than or equal to 50 characters long.'
    })
})

// Assuming users will often be queried by email and it must be unique.
userSchema.index({ email: 1 }, { unique: true, background: true })

// Useful if searching by full name is common.
userSchema.index({ fname: 1, lname: 1 })

// Add passport-local-mongoose to User schema.
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  errorMessages: {
    IncorrectPasswordError: 'Incorrect login credentials',
    IncorrectUsernameError: 'Incorrect login credentials',
    MissingUsernameError: 'No email was given',
    UserExistsError: 'Email already in use'
  }
})

export default model('User', userSchema)
