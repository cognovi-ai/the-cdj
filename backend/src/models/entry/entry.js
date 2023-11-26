import { Schema, model } from 'mongoose';
import Joi from 'joi';

const entrySchema = new Schema({
  journal: { type: Schema.Types.ObjectId, ref: 'Journal', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  mood: { type: String },
  tags: [{ type: String }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  privacy_settings: {
    public: { type: Boolean, default: false },
    shared_with: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  }
});

entrySchema.statics.joi = Joi.object({
  title: Joi.string()
    .allow('')
    .max(100)
    .trim()
    .empty('')
    .default('Untitled'),
  content: Joi.string()
    .min(4)
    .max(1000)
    .required(),
  mood: Joi.string(),
  tags: Joi.array().items(Joi.string()),
  privacy_settings: Joi.object({
    public: Joi.boolean(),
    shared_with: Joi.array().items(Joi.string())
  })
}).default(); // Apply defaults for the entire object

// For retrieving entries in a journal, sorted by the creation date.
entrySchema.index({ journal: 1, created_at: -1 });

// If entries are frequently retrieved or searched by tags.
entrySchema.index({ tags: 1 });

// For quickly filtering public or private entries.
entrySchema.index({ 'privacy_settings.public': 1 });

export default model('Entry', entrySchema);
