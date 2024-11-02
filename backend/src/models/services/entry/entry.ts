import {
  Entry,
  EntryAnalysis,
  EntryConversation,
} from '../../index.js';
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

/**
 * TODO: Continue breaking up this function. Move out EntryAnalysis creation and populating with content
 * Creates a new Entry and corresponding EntryAnalysis in Journal
 * with journalId with entryContent as content
 *
 * @param journalId id of journal where creating new entry
 * @param configId id of config to use
 * @param entryContent body of entry, see EntryType
 * @returns new Entry document with reference to EntryAnalysis
 */
export async function createEntry(
  journalId: string,
  configId: string,
  entryData: object): Promise<HydratedDocument<EntryType>> {
  // Create new Entry and corresponding EntryAnalysis
  const newEntry = new Entry({ journal: journalId, ...entryData });
  const newAnalysis = new EntryAnalysis({
    entry: newEntry.id,
  });
  
  // Associate the entry with the analysis
  newEntry.analysis = newAnalysis.id;
  
  // Get the analysis content for the entry
  try {
    const analysis = await newAnalysis.getAnalysisContent(
      configId,
      newEntry.content
    );
  
    // Complete the entry and analysis with the analysis content if available
    if (analysis) {
      newEntry.title = analysis.title;
      newEntry.mood = analysis.mood;
      newEntry.tags = analysis.tags;
  
      // TODO: you might validate here instead, not use middleware
      newAnalysis.analysis_content = analysis.analysis_content;
    }
  } finally {
    await newEntry.save();
    await newAnalysis.save();
  }
  return newEntry;
}