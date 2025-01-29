import CdGpt, { ChatCompletionResponse, } from '../../assistants/gpts/CdGpt.js';
import { Model, Schema, Types, model } from 'mongoose';

import ExpressError from '../../utils/ExpressError.js';
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

interface EntryConversationMethods {
  getChatContent(
    analysisId: string,
    content: string,
    messages?: ChatMessage[]
  ): Promise<string>;
}

/* eslint-disable @typescript-eslint/no-empty-object-type */
// Done to match: https://mongoosejs.com/docs/typescript/statics-and-methods.html
interface EntryConversationStatics
  extends Model<EntryConversationType, {}, EntryConversationMethods> {
  joi(obj: unknown, options?: object): Joi.ValidationResult;
}

const chatMessageSchema = new Schema({
  message_content: { type: String, required: true },
  llm_response: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const entryConversationSchema = new Schema<
  EntryConversationType,
  EntryConversationStatics,
  EntryConversationMethods
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

async function getAnalysisCompletion(
  analysisId: string,
  messages: ChatMessage[],
  content: string
) {
  if (process.env.OPENAI_API_KEY === undefined) {
    throw new Error(
      'OpenAI API Key not set. Cannot retrieve conversation response'
    );
  }
  const cdGpt = new CdGpt(
    process.env.OPENAI_API_KEY,
    process.env.OPENAI_API_MODEL,
  );

  await cdGpt.seedChatMessages(analysisId, messages);
  cdGpt.addUserMessage({ chat: content });

  const response = await cdGpt.getChatCompletion();
  if (response.error) {
    throw new ExpressError(response.error.message, 400);
  }

  return response;
}
//TODO: pull out this method to somewhere else. dependency on CdGpt not great
// Get the analysis content for an entry
entryConversationSchema.methods.getChatContent = async function (
  analysisId: string,
  content: string,
  messages: ChatMessage[] = []
): Promise<string> {
  const response: ChatCompletionResponse = await getAnalysisCompletion(
    analysisId,
    messages,
    content
  );

  return response.choices[0].message.content;
};

export default model<EntryConversationType, EntryConversationStatics>(
  'EntryConversation',
  entryConversationSchema
);
