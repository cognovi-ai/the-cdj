import {
  Entry,
  EntryAnalysis,
  EntryConversation,
} from '../../index.js';
import { EntryConversationRequestBody, EntryRequestBody } from '../../../controllers/entry/entry.js';
import mongoose, { HydratedDocument } from 'mongoose';
import { EntryAnalysisType } from '../../entry/entryAnalysis.js';
import { EntryConversationType } from '../../entry/entryConversation.js';
import { EntryType } from '../../entry/entry.js';
import ExpressError from '../../../utils/ExpressError.js';

/**
 * EntryResponse type returned by PUT and POST entry operations.
*/
interface EntryResponse {
  errMessage?: string;
  entry: HydratedDocument<EntryType>;
}

/**
 * Returns array of all entries in a journal.
 *
 * @param journalId Journal._id as string
 * @returns array of documents in journal with journalId
 */
export async function getAllEntriesInJournal(
  journalId: string
): Promise<HydratedDocument<EntryType>[]> {
  return await Entry.find({ journal: journalId });
}

/**
 * Gets Entry with entryId.
 * 
 * @param entryId id of Entry
 * @returns Entry or null
 */
export async function getEntryById(entryId: string) {
  return await Entry.findById(entryId);
}

/**
 * Gets EntryAnalysis for Entry with entryId.
 * 
 * @param entryId id of Entry associated with analysis
 * @returns EntryAnalysis or null
 */
export async function getEntryAnalysisById(entryId: string) {
  return await EntryAnalysis.findOne({ entry: entryId });
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
  return await EntryAnalysis
    .findOne({ entry: entryId })
    .populate<{
      entry: EntryType,
    }>('entry');
}

/**
 * Gets EntryConversation corresponding to entryId.
 *
 * @param entryId string of Entry._id to get
 * @returns EntryConversation matching entryId
 */
export async function getEntryConversation(entryId: string) {
  return await EntryConversation.findOne({ entry: entryId });
}

/**
 * Creates a new Entry and corresponding EntryAnalysis in Journal
 * with journalId with entryContent as content
 * 
 * @param journalId id of journal where creating new entry
 * @param configId id of config to use
 * @param entryData body of entry
 * @returns new Entry document with reference to EntryAnalysis
 */
export async function createEntry(
  journalId: string,
  configId: string,
  entryData: EntryRequestBody,
) {
  const newEntry = new Entry({ journal: journalId, ...entryData });
  const newAnalysis = new EntryAnalysis({
    entry: newEntry.id,
  });

  newEntry.analysis = newAnalysis.id;

  return await _updateEntry(newEntry, newAnalysis, configId);
}

/**
 * Updates Entry with entryId and associated EntryAnalysis.
 * If content changes, will generate new LLM analysis.
 * 
 * @param entryId id of Entry to update
 * @param configId id of Config for LLM
 * @param entryData body of entry
 * @returns updated Entry and error message if error occurred
 */
export async function updateEntry(
  entryId: string,
  configId: string,
  entryData: EntryRequestBody,
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
 * Generates new LLM analysis for EntryAnalysis associated with entryId
 * and updates fields.
 * 
 * @param entryId id of entry associated with EntryAnalysis to update
 * @param configId id of config to use for LLM
 * @returns updated EntryAnalysis, Entry, and possibly error message
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

/**
 * Deletes Entry by ID and associated EntryConversation and EntryAnalysis.
 * 
 * @param entryId id of entry to delete
 */
export async function deleteEntry(
  entryId: string
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const response = await Entry.findByIdAndDelete(entryId, { session });

    if (!response) {
      throw new Error('Entry not found.');
    }

    await EntryConversation.deleteMany({ entry: entryId }, { session });
    await EntryAnalysis.deleteMany({ entry: entryId }, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Creates new EntryConversation for an Entry and populates with LLM response
 * 
 * @param entryId id of Entry to create EntryConversation for
 * @param messageData user-submitted messages to create conversation for
 * @param configId id of Config for LLM
 * @returns new EntryConversation from messageData
 */
export async function createEntryConversation(
  entryId: string,
  configId: string,
  messageData: EntryConversationRequestBody
) {
  // TODO: #198 check if this conditional is necessary; Joi validation should catch this before this line
  if (!messageData.messages || messageData.messages.length === 0) {
    throw new ExpressError('No message to get completion for.', 404);
  }
  // Get an entry with the analysis
  const { entry, entryAnalysis } = await _verifyEntry(entryId);
  
  const newConversation = new EntryConversation({
    entry: entryId,
    messages: messageData.messages,
  });

  entry.conversation = newConversation.id;
  
  // TODO: #199 try to use _populateChatContent. Can't currently because this doesn't append; it modifies in place
  const llmResponse = await newConversation.getChatContent(
    configId,
    entryAnalysis.id,
    messageData.messages[0].message_content
  );
  
  if (llmResponse) {
    // Messages defined because messageData.messages defined
    newConversation.messages![0].llm_response = llmResponse;
  }
  await newConversation.save();
  await entry.save();

  return newConversation;
}

/**
 * Updates EntryConversation associated with chatId with messages in messageData
 * and generates LLM response to them.
 * 
 * @param chatId id of EntryConversation
 * @param configId id of Config for LLM
 * @param messageData messages to update EntryConversation with
 * @returns Updated EntryConversation
 */
export async function updateEntryConversation(
  chatId: string,
  configId: string,
  messageData: EntryConversationRequestBody
) {
  const { conversation, analysis } = await _verifyEntryConversation(chatId);

  return await _populateChatContent(configId, analysis, messageData, conversation);
}

/**
 * Helper function for checking if Entry and EntryAnalysis associated with
 * entryId exist.
 * 
 * @param entryId id associated with Entry and EntryAnalysis to check
 * @returns Entry and EntryAnalysis associated with entryId
 */
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

/**
 * Helper function for updating Entry and EntryAnalysis with LLM content.
 * 
 * @param updatedEntry Entry to update
 * @param oldAnalysis EntryAnalysis to update with LLM content
 * @param configId id of Config for LLM
 * @returns Entry and EntryAnalysis updated with LLM content, and error message on error
 */
async function _updateEntry(
  updatedEntry: HydratedDocument<EntryType>,
  // TODO: #173, may not need to pass in oldAnalysis
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldAnalysis: any, 
  configId: string
) {
  // Creating return object to push error handling into service rather than controller
  const updateEntryResponse: EntryResponse = {
    entry: updatedEntry,
  };
  try {
    // TODO: #173, move getAnalysisContent out of EntryAnalysis
    const analysis = await oldAnalysis.getAnalysisContent(
      configId,
      updatedEntry.content
    );
  
    if (analysis) {
      updatedEntry.title = analysis.title;
      updatedEntry.mood = analysis.mood;
      updatedEntry.tags = analysis.tags;
  
      // TODO: you might validate here instead, not use middleware
      oldAnalysis.analysis_content = analysis.analysis_content;
    }
  } catch (analysisError) {
    updateEntryResponse.errMessage = (analysisError as Error).message;
  } finally {
    await updatedEntry.save();
    await oldAnalysis.save();
  }
  return updateEntryResponse;
}

/**
 * Helper function for updating EntryConversation with LLM content based on messageData.
 * 
 * @param configId id of Config for LLM
 * @param analysis EntryAnalysis
 * @param messageData messages to get LLM content for
 * @param conversation EntryConversation to update
 * @returns EntryConversation updated with LLM content
 */
async function _populateChatContent(
  configId: string,
  analysis: HydratedDocument<EntryAnalysisType>,
  messageData: EntryConversationRequestBody,
  // TODO: #174 define conversation type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conversation: any
): Promise<HydratedDocument<EntryConversationType>> {
  const llmResponse = await conversation.getChatContent(
    configId,
    analysis.id,
    messageData.messages[0].message_content,
    conversation.messages
  );

  /*
  FIXME: User messages should save even if llmResponse fails. Need to decouple user and 
  LLM chat messages.
  */
  if (llmResponse) {
    messageData.messages[0].llm_response = llmResponse;
    conversation.messages?.push(messageData.messages[0]);
    await conversation.save();
  }
  return conversation;
}

/**
 * Helper function for checking if EntryConversation and EntryAnalysis
 * associated with chatId exist.
 * 
 * @param chatId id of EntryConversation to verify
 * @returns EntryConversation and EntryAnalysis associated with chatId
 */
async function _verifyEntryConversation(
  chatId: string
) {
  const conversation = await EntryConversation.findById(chatId);
  if (!conversation) {
    throw new ExpressError('Entry conversation not found.', 404);
  }
  if (!conversation.messages) {
    throw new ExpressError('Entry conversation messages not found.', 404);
  }
  const analysis = await EntryAnalysis.findOne({ entry: conversation.entry });
  if (!analysis) {
    throw new ExpressError('Entry analysis not found.', 404);
  }
  return { conversation, analysis };
}