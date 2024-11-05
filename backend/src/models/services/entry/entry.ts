import * as CdGptServices from '../CdGpt.js';
import {
  Entry,
  EntryAnalysis,
  EntryConversation,
} from '../../index.js';
import { EntryAnalysisType } from '../../entry/entryAnalysis.js';
import { EntryConversationType } from '../../entry/entryConversation.js';
import { EntryType } from '../../entry/entry.js';
import ExpressError from '../../../utils/ExpressError.js';
import { HydratedDocument } from 'mongoose';
import { UpdateEntryRequestBody } from '../../../controllers/entry/entry.js';

/**
 * TODO: consider moving this somewhere else. Might not be best fit here
 * given that it's for enforcing user input
 * Shape of data in request body when creating EntryConversation
 */
interface MessageData {
  messages: {
    message_content: string,
    llm_response: string
  }[]
}

/**
 * Return value of operations that create or update Entry
 */
interface EntryUpdateResponse {
  errMessage?: string;
  entry: HydratedDocument<EntryType>;
}

/**
 * Returns array of all entries in a journal
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
 * Gets Entry with entryId
 * @param entryId id of Entry
 * @returns Entry or null
 */
export async function getEntryById(entryId: string) {
  try {
    const entry = await Entry.findById(entryId);
    return entry;
  } catch (error) {
    console.error(error);
  }
  return null;
}

/**
 * Gets EntryAnalysis for Entry with entryId
 * @param entryId id of Entry associated with analysis
 * @returns EntryAnalysis or null
 */
export async function getEntryAnalysisById(entryId: string) {
  try {
    const analysis = await EntryAnalysis.findOne({ entry: entryId });
    return analysis;
  } catch (error) {
    console.error(error);
  }
  return null;
}

/**
 * Gets Entry with all referenced properties populated
 * @param entryId string of Entry._id to get
 * @param paths string of properties to populate
 * @returns Populated entry document matching entryId
 */
export async function getPopulatedEntry(entryId: string) {
  try {
    return await Entry
      .findById(entryId)
      .populate<{
        analysis: EntryAnalysisType,
        conversation: EntryConversationType
      }>('analysis conversation');
  } catch (error) {
    console.error(error);
  }
  return null;
}

/**
 * Gets EntryAnalysis corresponding to entryId and populates with its Entry
 * @param entryId string of Entry._id to get
 * @returns populated EntryAnalysis document matching entryId
 */
export async function getPopluatedEntryAnalysis(entryId: string) {
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
 * Gets EntryConversation corresponding to entryId
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
 * Creates a new Entry and corresponding EntryAnalysis in Journal
 * with journalId with entryContent as content
 *
 * This function doesn't throw errors because the original controller
 * handled them by creating a flash message with the error and continuing to
 * respond noramlly.
 * @param journalId id of journal where creating new entry
 * @param configId id of config to use
 * @param entryData body of entry
 * @returns new Entry document with reference to EntryAnalysis
 */
export async function createEntry(
  journalId: string,
  configId: string,
  entryData: UpdateEntryRequestBody,
) {
  // Create new Entry and corresponding EntryAnalysis
  const newEntry = new Entry({ journal: journalId, ...entryData });
  const newAnalysis = new EntryAnalysis({
    entry: newEntry.id,
  });

  // Associate the entry with the analysis
  newEntry.analysis = newAnalysis.id;

  return await _updateEntry(newEntry, newAnalysis, configId);
}

/**
 * Updates Entry with entryId and associated EntryAnalysis.
 * If content changes, will generate new LLM analysis.
 * @param entryId id of Entry to update
 * @param configId id of Config for LLM
 * @param entryData body of entry
 * @returns updated Entry and error message if error ocurred
 */
export async function updateEntry(
  entryId: string,
  configId: string,
  entryData: UpdateEntryRequestBody,
) {
  const { title: entryTitle, content: entryContent } = entryData;
  const { entry, entryAnalysis } = await _verifyEntry(entryId);

  if (entryContent) {
    entry.content = entryContent;
    return await _updateEntry(entry, entryAnalysis, configId);
  } else if (entryTitle) {
    entry.title = entryTitle;
    await entry.save();
  }
  return { entry: entry };
}

/**
 * 
 * @param entryId 
 * @param configId 
 * @returns 
 */
export async function updateEntryAnalysis(
  entryId: string,
  configId: string,
) {
  const { entry, entryAnalysis } = await _verifyEntry(entryId);
  return {
    ...await _updateEntry(entry, entryAnalysis, configId),
    entryAnalysis: entryAnalysis 
  };
}

async function _verifyEntry(entryId: string) {
  const entry = await getEntryById(entryId);
  if (!entry) {
    throw new Error('Entry not found.');
  }
  const entryAnalysis = await getEntryAnalysisById(entryId);
  if (!entryAnalysis) {
    throw new Error('Entry analysis not found.');
  }
  return { entry, entryAnalysis };
}

async function _updateEntry(
  updatedEntry: HydratedDocument<EntryType>,
  oldAnalysis: HydratedDocument<EntryAnalysisType>,
  configId: string
) {
  // Creating return object to push error handling into service rather than controller
  const updateEntryResult: EntryUpdateResponse = {
    entry: updatedEntry,
  };
  try {
    const analysis = await CdGptServices.getAnalysisContent(
      configId,
      updatedEntry.content
    );
  
    // Complete the entry and analysis with the analysis content if available
    if (analysis) {
      updatedEntry.title = analysis.title;
      updatedEntry.mood = analysis.mood;
      updatedEntry.tags = analysis.tags;
  
      // TODO: you might validate here instead, not use middleware
      oldAnalysis.analysis_content = analysis.analysis_content;
    }
  } catch (analysisError) {
    updateEntryResult.errMessage = (analysisError as Error).message;
  } finally {
    await updatedEntry.save();
    await oldAnalysis.save();
  }
  return updateEntryResult;
}

/**
 * TODO: continue breaking up this function
 * Creates new EntryConversation for an Entry and populates with LLM response
 * 
 * This function throws errors to replicate how the original function
 * handled them, which was to create a new error and call the error handler.
 * The controller is responsible for catching errors and calling
 * the error handler when using this function.
 * @param entryId id of Entry to create EntryConversation for
 * @param messageData user-submitted messages to create conversation for
 * @param configId id of Config for LLM
 * @returns new EntryConversation from messageData
 */
export async function createEntryConversation(
  entryId: string,
  configId: string,
  messageData: MessageData
) {
  // Get an entry with the analysis
  const entry = await Entry.findById(entryId);
  if (!entry) {
    throw new ExpressError('Entry not found.', 404);
  }
  if (!entry.analysis) {
    throw new ExpressError('Entry analysis not found.', 404);
  }
  
  const newConversation = new EntryConversation({
    entry: entryId,
    ...messageData,
  });
  /**
   * I don't think this case will ever get used because joi validation
   * rejects empty messages, and that happens before hitting this function, but it's defensive
   */
  if (!newConversation.messages || newConversation.messages.length === 0) {
    throw new ExpressError('No message to get completion for.', 404);
  }
  
  // Associate the conversation with the entry
  entry.conversation = newConversation.id;
  await entry.save();
  
  const llmResponse = await CdGptServices.getChatContent(
    configId,
    entry.analysis.toString(),
    messageData.messages[0].message_content
  );
  
  // If the chat is not empty, update the llm_response
  if (llmResponse) {
    newConversation.messages[0].llm_response = llmResponse;
  }
  await newConversation.save();

  return newConversation;
}