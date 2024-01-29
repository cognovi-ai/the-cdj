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

  if (entries.length === 0) {
    req.flash('info', 'Submit your first entry to get started.');
  }

  res.status(200).json({ entries, flash: req.flash() });
};

/**
 * Create a new entry and analysis in a specific journal.
 */
export const createEntry = async (req, res, next) => {
  const { journalId } = req.params;

  // Ensure that the journal exists
  const journal = await Journal.findById(journalId);
  if (!journal) {
    return next(new ExpressError('Journal not found.', 404));
  }

  validateEntryAnalysis(req, res, async (err) => {
    if (err) {
      return next(err); // Handle any validation errors
    }

    // If validation is successful, proceed to create the entry and analysis
    const entryData = req.body;

    const newEntry = new Entry({ journal: journalId, ...entryData });
    const newAnalysis = new EntryAnalysis({ entry: newEntry._id, analysis_content: entryData.analysis_content });

    // Associate the entry with the analysis
    newEntry.analysis = newAnalysis._id;

    // Get the analysis content for the entry
    try {
      const analysis = await newAnalysis.getAnalysisContent(journal.config, newEntry.content);

      // Complete the entry and analysis with the analysis content if available
      if (analysis) {
        newEntry.title = analysis.title;
        newEntry.mood = analysis.mood;
        newEntry.tags = analysis.tags;

        newAnalysis.analysis_content = analysis.analysis_content;
      }
    } catch (err) {
      req.flash('info', err.message);
    } finally {
      await newEntry.save();
      await newAnalysis.save();
    }

    res.status(201).json({ ...(await newEntry.save())._doc, flash: req.flash() });
  });
};

/**
 * Get an entry and all associated documents by ID.
 */
export const getAnEntry = async (req, res) => {
  const { entryId } = req.params;

  try {
    const entry = await Entry.findById(entryId).populate('analysis conversation');

    res.status(200).json(entry);
  } catch (err) {
    req.flash('info', err.message);
    return next(err);
  }
};

/**
 * Update an entry by ID.
 */
export const updateEntry = async (req, res, next) => {
  const { entryId, journalId } = req.params;

  const journal = await Journal.findById(journalId);
  if (!journal) {
    return next(new ExpressError('Journal not found.', 404));
  }

  validateEntryAnalysis(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    const entryData = req.body;
    const updatedEntry = await Entry.findById(entryId);

    // Update the entry with the new data
    updatedEntry.content = entryData.content;

    // Update the analysis content for the entry with a new analysis
    const oldAnalysis = await EntryAnalysis.findOne({ entry: entryId });

    try {
      const analysis = await oldAnalysis.getAnalysisContent(journal.config, updatedEntry.content);

      if (analysis) {
        updatedEntry.title = analysis.title;
        updatedEntry.mood = analysis.mood;
        updatedEntry.tags = analysis.tags;

        oldAnalysis.analysis_content = analysis.analysis_content;
      }
    } catch (err) {
      req.flash('info', err.message);
    } finally {
      await updatedEntry.save();
      await oldAnalysis.save();
    }

    req.flash('success', 'Successfully updated entry.');
    res.status(200).json({ ...(updatedEntry)._doc, flash: req.flash() });
  });
};

/**
 * Delete an entry by ID and all associated documents.
 */
export const deleteEntry = async (req, res, next) => {
  const { entryId } = req.params;

  // Start a session and transaction for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Delete the entry
    const response = await Entry.findByIdAndDelete(entryId, { session });

    if (!response) {
      return next(new ExpressError('Entry not found.', 404));
    }

    // Delete associated documents
    await EntryConversation.deleteMany({ entry: entryId }, { session });
    await EntryAnalysis.deleteMany({ entry: entryId }, { session });

    // Commit the transaction
    await session.commitTransaction();
  } catch (error) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    return next(new ExpressError('An error occurred while attempting to delete the entry.', 500));
  } finally {
    // End the session
    session.endSession();
  }

  req.flash('success', 'Successfully deleted entry.');
  res.status(200).json({ flash: req.flash() });
};

/**
 * Get an entry and its analysis by ID.
 */
export const getEntryAnalysis = async (req, res, next) => {
  // const { journalId, entryId } = req.params;
  const { entryId } = req.params;

  const entryAnalysis = await EntryAnalysis.findOne({ entry: entryId }).populate('entry');

  if (!entryAnalysis) {
    return next(new ExpressError('Entry analysis not found.', 404));
  }

  res.status(200).json(entryAnalysis._doc);
};

/**
 * Update the analysis of an entry by entry ID.
 */
export const updateEntryAnalysis = async (req, res, next) => {
  const { entryId, journalId } = req.params;

  // Ensure that the journal exists
  const journal = await Journal.findById(journalId);
  if (!journal) {
    return next(new ExpressError('Journal not found.', 404));
  }

  const entry = await Entry.findById(entryId);

  if (!entry) {
    return next(new ExpressError('Entry not found.', 404));
  }

  const entryAnalysis = await EntryAnalysis.findOne({ entry: entryId });

  try {
    const analysis = await entryAnalysis.getAnalysisContent(journal.config, entry.content);

    // Complete the entry and analysis with the analysis content if available
    if (analysis) {
      entry.title = analysis.title;
      entry.mood = analysis.mood;
      entry.tags = analysis.tags;

      entryAnalysis.analysis_content = analysis.analysis_content;

      entryAnalysis.save();
      entry.save();
      req.flash('success', 'Successfully generated a new analysis.');
    }
  } catch (err) {
    req.flash('info', err.message);
  }

  res.status(200).json({ ...(entryAnalysis)._doc, entry: entry._doc, flash: req.flash() });
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
export const createEntryConversation = async (req, res, next) => {
  const { entryId, journalId } = req.params;
  const messageData = req.body;

  const newConversation = new EntryConversation({
    entry: entryId,
    ...messageData
  });

  // Get the config from the journal
  const journal = await Journal.findById(journalId);

  // Get an entry with the analysis
  const entry = await Entry.findById(entryId).populate('analysis');

  // Associate the conversation with the entry
  entry.conversation = newConversation._id;
  await entry.save();

  try {
    const llmResponse = await newConversation.getChatContent(journal.config, entry.analysis._id, messageData.messages[0].message_content);

    // If the chat is not empty, update the llm_response
    if (llmResponse) {
      newConversation.messages[0].llm_response = llmResponse;
    }
  } catch (err) {
    return next(err);
  }

  await newConversation.save();

  const response = await EntryConversation.findOne({ entry: entryId });
  const entryConversation = response ? response._doc : {};

  req.flash('success', 'Successfully created conversation.');
  res.status(201).json({ ...entryConversation, flash: req.flash() });
};

/**
 * Update a conversation for a specific entry.
 */
export const updateEntryConversation = async (req, res, next) => {
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
    return next(err);
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

  res.status(200).json({ ...(response)._doc, flash: req.flash() });
};
