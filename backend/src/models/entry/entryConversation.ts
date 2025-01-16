import { Model, Schema, Types, model } from 'mongoose';

import Joi from 'joi';

export interface ChatMessage {
  message_content: string;
  llm_response: string;
  created_at?: Date;
}

export interface EntryConversationType {
  entry: Types.ObjectId;
  messages?: ChatMessage[];
}

/* eslint-disable @typescript-eslint/no-empty-object-type */
// Done to match: https://mongoosejs.com/docs/typescript/statics-and-methods.html
interface EntryConversationStatics
  extends Model<EntryConversationType, {}> {
  joi(obj: unknown, options?: object): Joi.ValidationResult;
}

const chatMessageSchema = new Schema({
  message_content: { type: String, required: true },
  llm_response: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

export const entryConversationSchema = new Schema<
  EntryConversationType,
  EntryConversationStatics
>({
  entry: { type: Schema.Types.ObjectId, ref: 'Entry', required: true },
  messages: { type: [chatMessageSchema], default: [] },
});

entryConversationSchema.statics.joi = function (
  obj: unknown,
  options?: object
): Joi.ValidationResult {
  const entryConversationJoiSchema = Joi.object({
    messages: Joi.array().items(
      Joi.object({
        message_content: Joi.string().min(1).trim().required(),
        llm_response: Joi.string()
          .allow('')
          .trim()
          .empty('')
          .default('Not connected to LLM'),
        created_at: Joi.date(),
      })
    ),
  });
  return entryConversationJoiSchema.validate(obj, options);
};

// For quickly fetching conversations related to an entry.
entryConversationSchema.index({ entry: 1 });

// To order messages within a conversation by time.
entryConversationSchema.index({ 'messages.created_at': 1 });

export default model<EntryConversationType, EntryConversationStatics>(
  'EntryConversation',
  entryConversationSchema
);
