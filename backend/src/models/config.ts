import { Model, Schema, model } from 'mongoose';
import Joi from 'joi';

export interface ConfigType {
  model?: {
    chat: string,
    analysis: string,
  },
  apiKey?: string,
  created_at: Date,
  updated_at: Date,
}

interface ConfigStatics extends Model<ConfigType> {
  joi(obj: unknown, options?: object): Joi.ValidationResult,
}

const configSchema = new Schema<ConfigType, ConfigStatics>({
  model: {
    chat: { type: String },
    analysis: { type: String }
  },
  apiKey: { type: String },
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

configSchema.statics.joi = function (obj: unknown, options?: object): Joi.ValidationResult {
  const joiConfigSchema = Joi.object({
    model: Joi.object({
      chat: modelFieldValidation,
      analysis: modelFieldValidation
    }).required()
  });
  return joiConfigSchema.validate(obj, options);
};

// Set new updated_at value before saving
configSchema.pre('save', function (next) {
  this.set({ updated_at: Date.now() });
  next();
});

export default model<ConfigType, ConfigStatics>('Config', configSchema);
