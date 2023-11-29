import { Schema, model } from 'mongoose';
import Joi from 'joi';

const configSchema = new Schema({
  model: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true }
});

configSchema.statics.joi = Joi.object({
  model: Joi.string()
    .pattern(/^[a-zA-Z0-9-.]+$/) // Allow alphanumerics, hyphens, and periods
    .min(4)
    .max(50)
    .required()
    .messages({
      'string.pattern.base': 'Model must only contain alphanumeric characters, hyphens, and periods.'
    }),
  apiKey: Joi.string()
    .pattern(/^[a-zA-Z0-9-]+$/) // Allow alphanumerics and hyphens
    .min(20)
    .max(50)
    .required()
    .messages({
      'string.pattern.base': 'API key must only contain alphanumeric characters and hyphens.'
    })
});

export default model('Config', configSchema);
