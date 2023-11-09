import { Schema, model } from 'mongoose';

const journalSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Indexing on user_id as journals will often be queried per user.
journalSchema.index({ user_id: 1 });
// If journals are listed by creation date.
journalSchema.index({ created_at: -1 });

export default model('Journal', journalSchema);
