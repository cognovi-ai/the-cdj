import {
  Config,
  Entry,
  EntryAnalysis,
  EntryConversation,
} from '../../index.js';
import CdGpt from '../../../assistants/gpts/CdGpt.js';
import { EntryAnalysisType } from '../../entry/entryAnalysis.js';
import { EntryConversationType } from '../../entry/entryConversation.js';
import { EntryType } from '../../entry/entry.js';
import { HydratedDocument } from 'mongoose';


/**
 * Returns array of all entries in a journal.
 *
 * @param journalId Journal._id as string
 * @returns array of documents in journal with journalId
 */
export async function getAllEntriesInJournal(
  journalId: string
): Promise<HydratedDocument<EntryType>[]> {
  try {
    const res = await Entry.find({ journal: journalId });
    return res;
  } catch (err) {
    console.error(err);
  }
  return [];
}

/**
 * Gets Entry with all referenced properties populated.
 *
 * @param entryId string of Entry._id to get
 * @param paths string of properties to populate
 * @returns Populated entry document matching entryId
 */
export async function getPopulatedEntry(entryId: string) {
  return await Entry
    .findById(entryId)
    .populate<{
      analysis: EntryAnalysisType,
      conversation: EntryConversationType
    }>('analysis conversation');
}

/**
 * Gets EntryAnalysis corresponding to entryId and populates with its Entry.
 *
 * @param entryId string of Entry._id to get
 * @returns populated EntryAnalysis document matching entryId
 */
export async function getPopulatedEntryAnalysis(entryId: string) {
  try {
    return await EntryAnalysis
      .findOne({ entry: entryId })
      .populate<{
        entry: EntryType,
      }>('entry');
  } catch (err) {
    console.error(err);
  }
  return null;
}

/**
 * Gets EntryConversation corresponding to entryId.
 *
 * @param entryId string of Entry._id to get
 * @returns EntryConversation matching entryId
 */
export async function getEntryConversation(entryId: string) {
  try {
    return await EntryConversation.findOne({ entry: entryId });
  } catch (err) {
    console.error(err);
  }
  return null;
}

// TODO: All functions below are in-progress for create operations and are not being used currently. DL will be working on them in other PRs

/**
 * Creates a new entry in journalId with entryContent as content
 * @param journalId Journal._id as string
 * @param entryContent body of entry
 * @returns new Entry document on success, and null on error.
 */
export async function createEntry(
  journalId: string,
  entryContent: object
): Promise<HydratedDocument<EntryType> | null> {
  /**
   * TODO: may want to define entryContent type.
   * Currently, it's based on EntryValidation and Entry joi schemas together b/c validation middleware.
   * Takes on validation value but b/c mongoose strict mode, non-schema fields are dropped
   */
  try {
    const newEntry = await Entry.create({ journal: journalId, ...entryContent });
    return newEntry;
  } catch (err) {
    console.error(err);
  }
  return null;
}

/**
 * Creates empty EntryAnalysis for an Entry, and updates entry with
 * refernces to new EntryAnalysis.
 * @param configId Config._id as string
 * @param refEntry Document of target Entry to generate analysis for
 * @returns new EntryAnalysis for refEntry
 */
export async function createEntryAnalysis(
  configId: string,
  refEntry: HydratedDocument<EntryType>
): Promise<HydratedDocument<EntryAnalysisType>> {
  const newAnalysis = await EntryAnalysis.create({
    entry: refEntry.id,
  });

  // Associate the entry with the analysis
  refEntry.analysis = newAnalysis.id;
  await refEntry.save();

  return newAnalysis;
}

/**
 * Generates analysis body for refEntry, and updates refEntry and refAnalysis
 * with analysis response.
 * @param configId Config._id as string
 * @param refEntry Document of target Entry to generate analysis for
 * @param refAnalysis Document of EntryAnalysis to generate analysis for
 */
export async function populateAnalysisContent(
  configId: string,
  refEntry: HydratedDocument<EntryType>,
  refAnalysis: HydratedDocument<EntryAnalysisType>
): Promise<void> {
  try {
    const analysis = await getAnalysisContent(
      configId,
      refEntry.content
    );

    // Complete the entry and analysis with the analysis content if available
    if (analysis) {
      refEntry.title = analysis.title;
      refEntry.mood = analysis.mood;
      refEntry.tags = analysis.tags;

      refAnalysis.analysis_content = analysis.analysis_content;
    }
    await refEntry.save();
    await refAnalysis.save();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Calls LLM API to retrieve analysis for entry content.
 * @param configId Config._id for LLM to use
 * @param content user entry to generate analysis of
 * @returns LLM analysis JSON
 */
async function getAnalysisContent(configId: string, content: string): Promise<any> {
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

  const cdGpt = new CdGpt(process.env.OPENAI_API_KEY, config.model.analysis);

  cdGpt.seedAnalysisMessages();
  cdGpt.addUserMessage({ analysis: content });

  //TODO: replace type with better fitting one
  const analysisCompletion: any = await cdGpt.getAnalysisCompletion();

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
}
