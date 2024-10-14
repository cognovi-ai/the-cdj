import { Model, Schema, Types, model } from 'mongoose';

import CdGpt from '../../assistants/gpts/CdGpt.js';

import { Config } from '../index.js';

import Joi from 'joi';

export interface EntryAnalysisType {
  entry: Types.ObjectId;
  analysis_content?: string;
  created_at?: Date;
  updated_at?: Date;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: any should be replaced with return type from cdgpt response
interface EntryAnalysisMethods {
  getAnalysisContent(configId: string, content: string): Promise<any>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-empty-object-type */
// Done to match: https://mongoosejs.com/docs/typescript/statics-and-methods.html
interface EntryAnalysisStatics
  extends Model<EntryAnalysisType, {}, EntryAnalysisMethods> {
  joi(obj: unknown, options?: object): Joi.ValidationResult;
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

const entryAnalysisSchema = new Schema<
  EntryAnalysisType,
  EntryAnalysisStatics,
  EntryAnalysisMethods
>({
  entry: { type: Schema.Types.ObjectId, ref: 'Entry', required: true },
  analysis_content: { type: String, default: 'Analysis not available' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

entryAnalysisSchema.statics.joi = function (
  obj: unknown,
  options?: object
): Joi.ValidationResult {
  const entryAnalysisJoiSchema = Joi.object({
    analysis_content: Joi.string()
      .allow('')
      .trim()
      .empty('')
      .default('Analysis not available'),
  });
  return entryAnalysisJoiSchema.validate(obj, options);
};

// As analyses are tied to specific entries, this will speed up retrieval.
entryAnalysisSchema.index({ entry: 1 });

// Set new updated_at value on update
entryAnalysisSchema.pre('save', function (next) {
  this.updated_at = new Date(Date.now());
  next();
});

/* eslint-disable @typescript-eslint/no-explicit-any */
//TODO: pull out this method to somewhere else. dependency on CdGpt not great
/**
 * @deprecated see PR #83
 * @param configId string ID of config to update
 */
async function removeLegacyApiKey(configId: string): Promise<string> {
  const config = await Config.findById(configId);

  if (!config) {
    throw new Error('Configure your account settings to get an analysis.');
  } else if (config.apiKey) {
    try {
      // Remove an API key from a legacy config
      await Config.findByIdAndUpdate(config._id, { $unset: { apiKey: 1 } });
    } catch (err) {
      if (typeof err === 'string') {
        throw new Error(err);
      } else if (err instanceof Error) {
        throw err;
      }
    }
  }
  return config.model.analysis;
}

async function getAnalysisCompletion(
  configModelAnalysis: string,
  content: string
): Promise<any> {
  if (process.env.OPENAI_API_KEY === undefined) {
    throw new Error('OPENAI_API_KEY undefined. Must be set to get analysis');
  }
  const cdGpt = new CdGpt(
    process.env.OPENAI_API_KEY,
    configModelAnalysis,
    '',
    0.7
  );

  cdGpt.seedAnalysisMessages();
  cdGpt.addUserMessage({ analysis: content });

  const analysisCompletion: any = await cdGpt.getAnalysisCompletion();

  if (analysisCompletion.error) {
    throw new Error(analysisCompletion.error.message);
  }

  return JSON.parse(analysisCompletion.choices[0].message.content);
}

// Get the analysis content for an entry
entryAnalysisSchema.methods.getAnalysisContent = async function (
  configId: string,
  content: string
): Promise<any> {
  const configModelAnalysis = await removeLegacyApiKey(configId);
  const response = await getAnalysisCompletion(configModelAnalysis, content);
  const {
    reframed_thought: reframing,
    distortion_analysis: analysis,
    impact_assessment: impact,
    affirmation,
    is_healthy: isHealthy,
  } = response;

  if (!isHealthy) {
    if (!analysis || !impact || !reframing) {
      throw new Error('Analysis content is not available.');
    }
    response.analysis_content =
      analysis + ' ' + impact + ' Think, "' + reframing + '"' || affirmation;
  } else {
    response.analysis_content = affirmation;
  }
  return response;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export default model<EntryAnalysisType, EntryAnalysisStatics>(
  'EntryAnalysis',
  entryAnalysisSchema
);
