import { Config, EntryAnalysis } from '../index.js';
import { Schema, model, InferSchemaType } from 'mongoose';

import CdGpt from '../../assistants/gpts/CdGpt.js';

import ExpressError from '../../utils/ExpressError.js';
import Joi from 'joi';

const entryConversationSchema = new Schema({
  entry: { type: Schema.Types.ObjectId, ref: 'Entry', required: true },
  messages: [{
    message_content: { type: String, required: true },
    llm_response: { type: String },
    created_at: { type: Date, default: Date.now }
  }]
});

entryConversationSchema.statics.joi = function (obj) {
  const entryConversationJoiSchema = Joi.object({
    messages: Joi.array().items(Joi.object({
      message_content: Joi.string()
        .min(1)
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
  return entryConversationJoiSchema.validate(obj);
}

// For quickly fetching conversations related to an entry.
entryConversationSchema.index({ entry: 1 });

// To order messages within a conversation by time.
entryConversationSchema.index({ 'messages.created_at': 1 });

// Get the analysis content for an entry
entryConversationSchema.methods.getChatContent = async function (configId: string, analysisId: string, content: string, messages = []) {
  const config = await Config.findById(configId);

  if (!config) {
    throw new ExpressError('Configure your account settings to chat.', 404);
  } else if (config.apiKey) {
    try {
      // Remove an API key from a legacy config
      await Config.findByIdAndUpdate(config._id, { $unset: { apiKey: 1 } });
    } catch (err) {
      if (typeof err === "string") {
        throw new ExpressError(err, 500);
      } else if (err instanceof Error) {
        throw new ExpressError(err.message, 500);
      } 
    }
  }

  const cdGpt = new CdGpt(process.env.OPENAI_API_KEY, config.model.chat);

  const analysis = await EntryAnalysis.findById(analysisId).populate('entry');

  if (!analysis) {
    throw new ExpressError('Analysis not found.', 404);
  }

  cdGpt.seedChatMessages(analysis, messages);
  cdGpt.addUserMessage({ chat: content });

  const response = await cdGpt.getChatCompletion();

  if (response.error) {
    throw new ExpressError(response.error.message, 400);
  }

  return response.choices[0].message.content;
};

export type EntryConversationType = InferSchemaType<typeof entryConversationSchema>;
export default model('EntryConversation', entryConversationSchema);
