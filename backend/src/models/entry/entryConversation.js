import { Schema, model } from 'mongoose';

const entryConversationSchema = new Schema({
    entry: { type: Schema.Types.ObjectId, ref: 'Entry', required: true },
    messages: [{
        message_content: { type: String, required: true },
        llm_response: { type: String },
        created_at: { type: Date, default: Date.now }
    }]
});

// For quickly fetching conversations related to an entry.
entryConversationSchema.index({ entry: 1 });
// To order messages within a conversation by time.
entryConversationSchema.index({ 'messages.created_at': 1 });

export default model('EntryConversation', entryConversationSchema);