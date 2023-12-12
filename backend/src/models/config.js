import { Schema, model } from 'mongoose';
import { decrypt, encrypt } from '../utils/aes.js';
import Joi from 'joi';

const configSchema = new Schema({
  model: {
    chat: { type: String },
    analysis: { type: String }
  },
  apiKey: { type: String, unique: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Common validation schema for both chat and analysis
const modelFieldValidation = Joi.string()
  .pattern(/^[a-zA-Z0-9-.]+$/) // Allow alphanumerics, hyphens, and periods
  .allow('')
  .max(50)
  .messages({
    'string.pattern.base': 'Field must only contain alphanumeric characters, hyphens, and periods.'
  });

configSchema.statics.joi = Joi.object({
  model: Joi.object({
    chat: modelFieldValidation,
    analysis: modelFieldValidation
  }).required(),
  apiKey: Joi.string()
    .pattern(/^[a-zA-Z0-9-]{0,128}$/)
    .allow('')
    .messages({
      'string.pattern.base': 'API key must only contain alphanumeric characters and hyphens.'
    })
});

// Encrypt the apiKey
configSchema.methods.encrypt = function (apiKey) {
  return encrypt(apiKey);
};

// Decrypt the apiKey
configSchema.methods.decrypt = function () {
  return decrypt(this.apiKey);
};

// Set new updated_at value before saving
configSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

export default model('Config', configSchema);
