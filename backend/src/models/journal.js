import { Schema, model } from 'mongoose';
import Joi from 'joi';

const journalSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  config: { type: Schema.Types.ObjectId, ref: 'Config' },
  title: { type: String, required: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

journalSchema.statics.joi = Joi.object({
  title: Joi.string()
    .allow('')
    .max(100)
    .trim()
    .empty('')
    .default('Untitled')
});

// Indexing on user as journals will often be queried per user.
journalSchema.index({ user: 1 });
// If journals are listed by creation date.
journalSchema.index({ created_at: -1 });

// Set new updated_at value before saving
journalSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

export default model('Journal', journalSchema);
