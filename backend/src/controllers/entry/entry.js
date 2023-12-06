import { Entry, EntryAnalysis, EntryConversation, Journal } from '../../models/index.js';

import ExpressError from '../../utils/ExpressError.js';

import mongoose from 'mongoose';

import { validateEntryAnalysis } from '../../middleware/validation.js';

/**
 * Get all entries in a specific journal.
 */
export const getAllEntries = async (req, res) => {
  const { journalId } = req.params;

  const entries = await Entry.find({ journal: journalId });

  res.status(200).json({ entries });
};

/**
 * Create a new entry and analysis in a specific journal.
 */
export const createEntry = async (req, res, next) => {
  const { journalId } = req.params;

  // Ensure that the journal exists
  const journal = await Journal.findById(journalId);
  if (!journal) {
    return next(new ExpressError('Journal not found', 404));
  }

  validateEntryAnalysis(req, res, async (err) => {
    if (err) {
      return next(err); // Handle any validation errors
    }

    // If validation is successful, proceed to create the entry and analysis
    const entryData = req.body;

    const newEntry = new Entry({ journal: journalId, ...entryData });
    const newAnalysis = new EntryAnalysis({ entry: newEntry._id, analysis_content: entryData.analysis_content });

    // Get the analysis content for the entry
    try {
      const response = await newAnalysis.getAnalysisContent(journal.config, newEntry.content);
      // Parse the response
      const analysis = JSON.parse(response);

      // Complete the entry and analysis with the analysis content if available
      if (analysis) {
        newEntry.title = analysis.title;
        newEntry.mood = analysis.mood;
        newEntry.tags = analysis.tags;

        newAnalysis.analysis_content = analysis.analysis_content;
      }
    } catch (err) {
      res.append('Error', err);
    } finally {
      await newEntry.save();
      await newAnalysis.save();
    }

    res.status(201).json(await newEntry.save());
  });
};

/**
 * Get an entry by ID.
 */
export const getAnEntry = async (req, res) => {
  const { entryId } = req.params;

  const entry = await Entry.findById(entryId);

  res.status(200).json(entry);
};

/**
 * Update an entry by ID.
 */
export const updateEntry = async (req, res) => {
  const { entryId } = req.params;

  const entryData = req.body;
  const updatedEntry = await Entry.findByIdAndUpdate(entryId, entryData, { new: true });

  res.status(200).json(updatedEntry);
};

/**
 * Delete an entry by ID and all associated documents.
 */
export const deleteEntry = async (req, res) => {
  const { entryId } = req.params;

  // Start a session and transaction for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Delete the entry
    await Entry.findByIdAndDelete(entryId, { session });

    // Delete associated documents
    await EntryConversation.deleteMany({ entry: entryId }, { session });
    await EntryAnalysis.deleteMany({ entry: entryId }, { session });

    // Commit the transaction
    await session.commitTransaction();
  } catch (error) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    throw error;
  } finally {
    // End the session
    session.endSession();
  }

  res.status(200).json({ message: `Successfully deleted entry ${ entryId }` });
};

/**
 * Get an entry and its analysis by ID.
 */
export const getEntryAnalysis = async (req, res, next) => {
  // const { journalId, entryId } = req.params;
  const { entryId } = req.params;

  const entryAnalysis = await EntryAnalysis.findOne({ entry: entryId }).populate('entry');

  if (!entryAnalysis) {
    return next(new ExpressError('Entry analysis not found', 404));
  }

  res.status(200).json(entryAnalysis._doc);
};

/**
 * Get a conversation for a specific entry.
 */
export const getEntryConversation = async (req, res) => {
  const { entryId } = req.params;

  const response = await EntryConversation.findOne({ entry: entryId });
  const entryConversation = response ? { ...response._doc, chatId: response._id } : {};

  res.status(200).json(entryConversation);
};

/**
 * Create a conversation for a specific entry.
 */
export const createEntryConversation = async (req, res) => {
  const { entryId, journalId } = req.params;
  const messageData = req.body;

  const newConversation = new EntryConversation({
    entry: entryId,
    ...messageData
  });

  // Get the config from the journal
  const journal = await Journal.findById(journalId);

  // Get the analysis associated with the entry
  const analysis = await EntryAnalysis.findOne({ entry: entryId });

  try {
    const llmResponse = await newConversation.getChatContent(journal.config, analysis._id, messageData.messages[0].message_content);

    // If the chat is not empty, update the llm_response
    if (llmResponse) {
      newConversation.messages[0].llm_response = llmResponse;
    }
  } catch (err) {
    res.append('Error', err);
  } finally {
    await newConversation.save();
  }

  const response = await EntryConversation.findOne({ entry: entryId });
  const entryConversation = response ? response._doc : {};

  res.status(201).json(entryConversation);
};

/**
 * Update a conversation for a specific entry.
 */
export const updateEntryConversation = async (req, res) => {
  const { chatId, journalId } = req.params;
  const messageData = req.body;

  // Get the config from the journal
  const journal = await Journal.findById(journalId);

  // Get the conversation from the database
  const conversation = await EntryConversation.findById(chatId);

  // Get the analysis associated with the entry
  const analysis = await EntryAnalysis.findOne({ entry: conversation.entry });

  try {
    const llmResponse = await conversation.getChatContent(journal.config, analysis._id, messageData.messages[0].message_content, conversation.messages);

    // If the chat is not empty, update the llm_response
    if (llmResponse) {
      messageData.messages[0].llm_response = llmResponse;
    }
  } catch (err) {
    res.append('Error', err);
  }

  const response = await EntryConversation.findOneAndUpdate(
    { _id: chatId },
    {
      $push: {
        ...messageData
      }
    },
    { new: true }
  );

  res.status(200).json(response);
};
