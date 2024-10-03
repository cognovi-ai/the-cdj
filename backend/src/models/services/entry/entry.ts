import { HydratedDocument } from 'mongoose';
import { EntryType } from '../../entry/entry.js';
import { EntryAnalysisType } from '../../entry/entryAnalysis.js';
import {
  Config,
  Entry,
  EntryAnalysis,
  EntryConversation,
  Journal,
} from '../../index.js';
import CdGpt from '../../../assistants/gpts/CdGpt.js';

export namespace EntryServices {

  /**
   * 
   * @param journalId 
   * @returns 
   */
  export async function getAllEntries(journalId: string): Promise<HydratedDocument<EntryType>[]> {
    return await Entry.find({ journal: journalId });
  }

  /**
   * 
   * @param journalId 
   * @returns 
   */
  export async function canCreateEntry(journalId: string): Promise<boolean> {
    const journal = await Journal.findById(journalId);
    return journal ? true : false;
  }

  /**
   * 
   * @param journalId 
   * @param entryData 
   */
  export async function createEntry(journalId: string, entryContent: object): Promise<HydratedDocument<EntryType>> {
    const newEntry = new Entry({ journal: journalId, ...entryContent }); // entryContent has non-schema fields after validation middleware, but b/c strict mode, non-schema fields are dropped
    await newEntry.save();
    return newEntry;
  }

  /**
   * 
   * @param entryId 
   * @param refEntry 
   * @returns 
   */
  export async function createEntryAnalysis(configId: string, refEntry: HydratedDocument<EntryType>): Promise<HydratedDocument<EntryAnalysisType>> {
    const newAnalysis = new EntryAnalysis({
      entry: refEntry.id,
    });

    // Associate the entry with the analysis
    refEntry.analysis = newAnalysis.id;

    try { // TODO:  try to extract this out into separate method. Hard because typining from getAnalysisContent not defined right, and having it as a model method is making it really difficult to separate from this function
      const analysis = await getAnalysisContent(
        configId,
        refEntry.content
      );

      // Complete the entry and analysis with the analysis content if available
      if (analysis) { // DL 9-27-24: I don't think users can set these from the UI
        refEntry.title = analysis.title;
        refEntry.mood = analysis.mood;
        refEntry.tags = analysis.tags;

        newAnalysis.analysis_content = analysis.analysis_content;
      }
    } catch (analysisError) {
      throw analysisError;
    } finally {
      await refEntry.save();
      await newAnalysis.save();
    }
    return newAnalysis;
  }

  async function getAnalysisContent(configId: string, content: string): Promise<any> {
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
}