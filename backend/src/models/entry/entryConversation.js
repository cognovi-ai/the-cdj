import { Schema, model } from 'mongoose';
import Joi from 'joi';

const entryConversationSchema = new Schema({
  entry: { type: Schema.Types.ObjectId, ref: 'Entry', required: true },
  messages: [{
    message_content: { type: String, required: true },
    llm_response: { type: String },
    created_at: { type: Date, default: Date.now }
  }]
});

entryConversationSchema.statics.joi = Joi.object({
  messages: Joi.array().items(Joi.object({
    message_content: Joi.string()
      .min(1)
      .max(280)
      .trim()
      .required(),
    llm_response: Joi.string()
      .allow('')
      .trim()
      .empty('')
      .default('Not connected to LLM'),
    created_at: Joi.date()
  }))
});

// For quickly fetching conversations related to an entry.
entryConversationSchema.index({ entry: 1 });

// To order messages within a conversation by time.
entryConversationSchema.index({ 'messages.created_at': 1 });

export default model('EntryConversation', entryConversationSchema);
