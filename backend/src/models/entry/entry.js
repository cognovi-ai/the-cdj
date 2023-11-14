import { Schema, model } from 'mongoose';

const entrySchema = new Schema({
    journal_id: { type: Schema.Types.ObjectId, ref: 'Journal', required: true },
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

// For retrieving entries in a journal, sorted by the creation date.
entrySchema.index({ journal_id: 1, created_at: -1 });
// If entries are frequently retrieved or searched by tags.
entrySchema.index({ tags: 1 });
// For quickly filtering public or private entries.
entrySchema.index({ 'privacy_settings.public': 1 });

export default model('Entry', entrySchema);