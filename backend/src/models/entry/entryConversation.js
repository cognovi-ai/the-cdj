import { Schema, model } from 'mongoose';

const entryConversationSchema = new Schema({
    entry_id: { type: Schema.Types.ObjectId, ref: 'Entry', required: true },
    messages: [{
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message_content: { type: String, required: true },
        created_at: { type: Date, default: Date.now }
    }]
});

// For quickly fetching conversations related to an entry.
entryConversationSchema.index({ entry_id: 1 });
// If it's common to search messages by user.
entryConversationSchema.index({ 'messages.user_id': 1 });
// To order messages within a conversation by time.
entryConversationSchema.index({ 'messages.created_at': 1 });

export default model('EntryConversation', entryConversationSchema);