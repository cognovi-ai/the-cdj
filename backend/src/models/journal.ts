import { Model, Schema, Types, model } from 'mongoose';
import Joi from 'joi';

export interface JournalType {
  user: Types.ObjectId;
  title?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface JournalStatics extends Model<JournalType> {
  joi(obj: unknown, options?: object): Joi.ValidationResult;
}

const journalSchema = new Schema<JournalType, JournalStatics>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'The Cognitive Distortion Journal' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

journalSchema.statics.joi = function (
  obj: unknown,
  options?: object
): Joi.ValidationResult {
  const journalJoiSchema = Joi.object({
    title: Joi.string()
      .max(100)
      .trim()
      .default('The Cognitive Distortion Journal'),
  });
  return journalJoiSchema.validate(obj, options);
};

// Indexing on user as journals will often be queried per user.
journalSchema.index({ user: 1 });
// If journals are listed by creation date.
journalSchema.index({ created_at: -1 });

// Set new updated_at value before saving
journalSchema.pre('save', function (next) {
  this.set({ updated_at: Date.now() });
  next();
});

export default model<JournalType, JournalStatics>('Journal', journalSchema);
