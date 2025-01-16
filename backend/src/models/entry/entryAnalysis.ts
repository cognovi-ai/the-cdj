import { Model, Schema, Types, model } from 'mongoose';

import Joi from 'joi';

export interface EntryAnalysisType {
  entry: Types.ObjectId,
  analysis_content?: string,
  created_at?: Date,
  updated_at?: Date,
}

/* eslint-disable @typescript-eslint/no-empty-object-type */
// Done to match: https://mongoosejs.com/docs/typescript/statics-and-methods.html
interface EntryAnalysisStatics extends Model<EntryAnalysisType, {}> {
  joi(obj: unknown, options?: object): Joi.ValidationResult,
}

const entryAnalysisSchema = new Schema<EntryAnalysisType, EntryAnalysisStatics>({
  entry: { type: Schema.Types.ObjectId, ref: 'Entry', required: true },
  analysis_content: { type: String, default: 'Analysis not available' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

entryAnalysisSchema.statics.joi = function (obj: unknown, options?: object): Joi.ValidationResult {
  const entryAnalysisJoiSchema = Joi.object({
    analysis_content: Joi.string()
      .allow('')
      .trim()
      .empty('')
      .default('Analysis not available')
  });
  return entryAnalysisJoiSchema.validate(obj, options);
};

// As analyses are tied to specific entries, this will speed up retrieval.
entryAnalysisSchema.index({ entry: 1 });

// Set new updated_at value on update
entryAnalysisSchema.pre('save', function (next) {
  this.updated_at = new Date(Date.now());
  next();
});

export default model<EntryAnalysisType, EntryAnalysisStatics>('EntryAnalysis', entryAnalysisSchema);