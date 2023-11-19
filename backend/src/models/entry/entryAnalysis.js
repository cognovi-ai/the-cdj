import { Schema, model } from 'mongoose';

const entryAnalysisSchema = new Schema({
    entry: { type: Schema.Types.ObjectId, ref: 'Entry', required: true },
    analysis_content: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// As analyses are tied to specific entries, this will speed up retrieval.
entryAnalysisSchema.index({ entry: 1 });

export default model('EntryAnalysis', entryAnalysisSchema);