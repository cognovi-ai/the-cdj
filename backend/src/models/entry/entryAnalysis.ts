import { Model, Schema, model, Types } from 'mongoose';

import CdGpt from '../../assistants/gpts/CdGpt.js';

import { Config } from '../index.js';

import Joi from 'joi';

export interface EntryAnalysisType {
  entry: Types.ObjectId,
  analysis_content?: string,
  created_at?: Date,
  updated_at?: Date,
}

interface EntryAnalysisMethods {
  getAnalysisContent(configId: string, content: string): Promise<any>,
}

interface EntryAnalysisStatics extends Model<EntryAnalysisType, {}, EntryAnalysisMethods> {
  joi(obj: any, options: object): Joi.ValidationResult<any>,
}

const entryAnalysisSchema = new Schema<EntryAnalysisType, EntryAnalysisStatics, EntryAnalysisMethods>({
  entry: { type: Schema.Types.ObjectId, ref: 'Entry', required: true },
  analysis_content: { type: String, default: 'Analysis not available' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

entryAnalysisSchema.statics.joi = function (obj: any, options: object): Joi.ValidationResult<any> {
  const entryAnalysisJoiSchema = Joi.object({
    analysis_content: Joi.string()
      .allow('')
      .trim()
      .empty('')
      .default('Analysis not available')
  });
  return entryAnalysisJoiSchema.validate(obj, options);
}

// As analyses are tied to specific entries, this will speed up retrieval.
entryAnalysisSchema.index({ entry: 1 });

// Set new updated_at value on update
entryAnalysisSchema.pre('save', function (next) {
  this.updated_at = new Date(Date.now());
  next();
});

//TODO: pull out this method to somewhere else. dependency on CdGpt not great
// Get the analysis content for an entry
entryAnalysisSchema.methods.getAnalysisContent = async function (configId: string, content: string): Promise<any> {
  const config = await Config.findById(configId);

  if (!config) {
    throw new Error('Configure your account settings to get an analysis.');
  } else if (config.apiKey) {
    try {
      // Remove an API key from a legacy config
      await Config.findByIdAndUpdate(config._id, { $unset: { apiKey: 1 } });
    } catch (err) {
      if (typeof err === "string") {
        throw new Error(err);
      } else if (err instanceof Error) {
        throw err;
      }
    }
  }

  const cdGpt = new CdGpt(process.env.OPENAI_API_KEY, config.model.analysis);

  cdGpt.seedAnalysisMessages();
  cdGpt.addUserMessage({ analysis: content });

  const analysisCompletion = await cdGpt.getAnalysisCompletion();

  if (analysisCompletion.error) {
    throw new Error(analysisCompletion.error.message);
  }

  const response = JSON.parse(analysisCompletion.choices[0].message.content);

  const { reframed_thought: reframing, distortion_analysis: analysis, impact_assessment: impact, affirmation, is_healthy: isHealthy } = response;

  if (!isHealthy) {
    if (!analysis || !impact || !reframing) {
      throw new Error('Analysis content is not available.');
    }

    response.analysis_content = analysis + ' ' + impact + ' Think, "' + reframing + '"' || affirmation;
  } else response.analysis_content = affirmation;

  return response;
};

export default model<EntryAnalysisType, EntryAnalysisStatics>('EntryAnalysis', entryAnalysisSchema);