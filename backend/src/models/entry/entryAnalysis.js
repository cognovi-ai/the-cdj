import { Schema, model } from 'mongoose';
import Joi from 'joi';

const entryAnalysisSchema = new Schema({
    entry: { type: Schema.Types.ObjectId, ref: 'Entry', required: true },
    analysis_content: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

export const joi = Joi.object({
    analysis_content: Joi.string()
        .allow('')
        .trim()
        .empty('')
        .default('Analysis not available'),
});

// As analyses are tied to specific entries, this will speed up retrieval.
entryAnalysisSchema.index({ entry: 1 });

export const db = model('EntryAnalysis', entryAnalysisSchema);