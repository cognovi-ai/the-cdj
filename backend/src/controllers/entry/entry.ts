import * as EntryServices from '../../models/services/entry/entry.js';
import {
  Entry,
  EntryAnalysis,
  EntryConversation,
  Journal,
} from '../../models/index.js';
import { NextFunction, Request, Response } from 'express';
import mongoose, { Document } from 'mongoose';
import { EntryAnalysisType } from '../../models/entry/entryAnalysis.js';
import ExpressError from '../../utils/ExpressError.js';
import { validateEntryAnalysis } from '../../middleware/validation.js';

/**
 * Get all entries in a specific journal.
 */
export const getAllEntries = async (req: Request, res: Response) => {
  const { journalId } = req.params;

  const entries = await EntryServices.getAllEntriesInJournal(journalId);

  if (entries.length === 0) {
    req.flash('info', 'Submit your first entry to get started.');
  }
  res.status(200).json({ entries, flash: req.flash() });
};

/**
 * Create a new entry and analysis in a specific journal.
 * Request params journalId: string
 * Request body matches joiEntrySchema, but might be missing fields
 */
export const createEntry = async (req: Request, res: Response, next: NextFunction) => {
  const { journalId } = req.params;

  // Ensure that the journal exists
  const journal = await Journal.findById(journalId);
  if (!journal) {
    return next(new ExpressError('Journal not found.', 404));
  }

  validateEntryAnalysis(req, res, async (err: ExpressError) => {
    if (err) {
      return next(err); // Handle any validation errors
    }

    // If validation is successful, proceed to create the entry and analysis
    const entryData = req.body;

    const newEntry = new Entry({ journal: journalId, ...entryData });
    const newAnalysis = new EntryAnalysis({
      entry: newEntry.id,
      analysis_content: entryData.analysis_content,
    });

    // Associate the entry with the analysis
    newEntry.analysis = newAnalysis._id;
    if (!journal.config) {
      return next(new ExpressError('Journal config not found.', 404));
    }
    // Get the analysis content for the entry
    try {
      const analysis = await newAnalysis.getAnalysisContent(
        journal.config.toString(),
        newEntry.content
      );

      // Complete the entry and analysis with the analysis content if available
      if (analysis) {
        newEntry.title = analysis.title;
        newEntry.mood = analysis.mood;
        newEntry.tags = analysis.tags;

        newAnalysis.analysis_content = analysis.analysis_content;
      }
    } catch (analysisError) {
      req.flash('info', (analysisError as Error).message);
    } finally {
      await newEntry.save();
      await newAnalysis.save();
    }

    res
      .status(201)
      .json({ ...(await newEntry.save()).toObject(), flash: req.flash() });
  });
};

/**
 * Get an entry and all associated documents by ID.
 */
export const getAnEntry = async (req: Request, res: Response, next: NextFunction) => {
  const { entryId } = req.params;

  try {
    const entry = await EntryServices.getPopulatedEntry(entryId);
    res.status(200).json(entry);
  } catch (err) {
    req.flash('info', (err as Error).message);
    return next(err);
  }
};

/**
 * Update an entry by ID.
 */
export const updateEntry = async (req: Request, res: Response, next: NextFunction) => {
  const { entryId, journalId } = req.params;

  const journal = await Journal.findById(journalId);
  if (!journal) {
    return next(new ExpressError('Journal not found.', 404));
  }

  validateEntryAnalysis(req, res, async (err: ExpressError) => {
    if (err) {
      return next(err);
    }

    const entryData = req.body;
    const updatedEntry = await Entry.findById(entryId);
    if (!updatedEntry) {
      return next(new ExpressError('Entry not found.', 404));
    }

    if (entryData.content) {
      // Update the entry with the new data
      updatedEntry.content = entryData.content;

      // Update the analysis content for the entry with a new analysis
      const oldAnalysis = await EntryAnalysis.findOne({ entry: entryId });
      if (!oldAnalysis) {
        return next(new ExpressError('Entry analysis not found.', 404));
      }
      if (!journal.config) {
        return next(new ExpressError('Journal config not found.', 404));
      }
      try {
        const analysis = await oldAnalysis.getAnalysisContent(
          journal.config.toString(),
          updatedEntry.content
        );

        if (analysis) {
          updatedEntry.title = analysis.title;
          updatedEntry.mood = analysis.mood;
          updatedEntry.tags = analysis.tags;

          oldAnalysis.analysis_content = analysis.analysis_content;
        }
      } catch (analysisError) {
        req.flash('info', (analysisError as Error).message);
      } finally {
        await updatedEntry.save();
        await oldAnalysis.save();
      }
    } else if (entryData.title) {
      updatedEntry.title = entryData.title;
      await updatedEntry.save();
    }

    req.flash('success', 'Successfully updated entry.');
    res.status(200).json({ ...updatedEntry.toObject(), flash: req.flash() });
  });
};

/**
 * Delete an entry by ID and all associated documents.
 */
export const deleteEntry = async (req: Request, res: Response, next: NextFunction) => {
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
  } catch {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    return next(
      new ExpressError(
        'An error occurred while attempting to delete the entry.',
        500
      )
    );
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
export const getEntryAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  const { entryId } = req.params;

  const entryAnalysis = await EntryServices.getPopluatedEntryAnalysis(entryId);

  if (!entryAnalysis) {
    return next(new ExpressError('Entry analysis not found.', 404));
  }

  res.status(200).json(entryAnalysis.toObject());
};

/**
 * Update the analysis of an entry by entry ID.
 */
export const updateEntryAnalysis = async (req: Request, res: Response, next: NextFunction) => {
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
  if (!entryAnalysis) {
    return next(new ExpressError('Entry not found.', 404));
  }
  if (!journal.config) {
    return next(new ExpressError('Journal config not found.', 404));
  }
  try {
    const analysis = await entryAnalysis.getAnalysisContent(
      journal.config.toString(),
      entry.content
    );

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
    req.flash('info', (err as Error).message);
  }

  res
    .status(200)
    .json({ ...entryAnalysis.toObject(), entry: entry.toObject(), flash: req.flash() });
};

/**
 * Get a conversation for a specific entry.
 */
export const getEntryConversation = async (req: Request, res: Response) => {
  const { entryId } = req.params;

  const response = await EntryServices.getEntryConversation(entryId);
  const entryConversation = response
    ? { ...response.toObject(), chatId: response.id }
    : {};

  res.status(200).json(entryConversation);
};

/**
 * Create a conversation for a specific entry.
 */
export const createEntryConversation = async (req: Request, res: Response, next: NextFunction) => {
  const { entryId, journalId } = req.params;
  const messageData = req.body;

  const newConversation = new EntryConversation({
    entry: entryId,
    ...messageData,
  });

  // Get the config from the journal
  const journal = await Journal.findById(journalId);
  if (!journal) {
    return next(new ExpressError('Journal not found.', 404));
  }
  if (!journal.config) {
    return next(new ExpressError('Journal config not found.', 404));
  }

  // Get an entry with the analysis
  const entry = await Entry.findById(entryId).populate<{ analysis: Document<EntryAnalysisType> }>('analysis');
  if (!entry) {
    return next(new ExpressError('Entry not found.', 404));
  }
  if (!entry.analysis) {
    return next(new ExpressError('Entry analysis not found.', 404));
  }

  // Associate the conversation with the entry
  entry.conversation = newConversation._id;
  await entry.save();

  try {
    if (entry.analysis === undefined) {
      return next(new ExpressError('Entry analysis not found.' , 500));
    }
    const llmResponse = await newConversation.getChatContent(
      journal.config.toString(),
      entry.analysis.id,
      messageData.messages[0].message_content
    );

    // If the chat is not empty, update the llm_response
    if (!newConversation.messages) {
      return next(new ExpressError('No message to get completion for.', 404));
    }
    if (llmResponse) {
      newConversation.messages[0].llm_response = llmResponse;
    }
  } catch (err) {
    return next(err);
  }

  await newConversation.save();

  const response = await EntryConversation.findOne({ entry: entryId });
  const entryConversation = response ? response.toObject() : {};

  req.flash('success', 'Successfully created conversation.');
  res.status(201).json({ ...entryConversation, flash: req.flash() });
};

/**
 * Update a conversation for a specific entry.
 */
export const updateEntryConversation = async (req: Request, res: Response, next: NextFunction) => {
  const { chatId, journalId } = req.params;
  const messageData = req.body;

  // Get the config from the journal
  const journal = await Journal.findById(journalId);
  if (!journal) {
    return next(new ExpressError('Journal not found.', 404));
  }

  // Get the conversation from the database
  const conversation = await EntryConversation.findById(chatId);
  if (!conversation) {
    return next(new ExpressError('Entry conversation not found.', 404));
  }
  if (!conversation.messages) {
    return next(new ExpressError('Entry conversation messages not found.', 404));
  }

  // Get the analysis associated with the entry
  const analysis = await EntryAnalysis.findOne({ entry: conversation.entry });
  if (!analysis) {
    return next(new ExpressError('Entry analysis not found.', 404));
  }

  if (!journal.config) {
    return next(new ExpressError('Journal config not found.', 404));
  }
  try {
    const llmResponse = await conversation.getChatContent(
      journal.config.toString(),
      analysis.id,
      messageData.messages[0].message_content,
      conversation.messages
    );

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
        ...messageData,
      },
    },
    { new: true }
  );
  if (!response) {
    return next(new ExpressError('Failed to update entry conversation.', 500));
  }

  res.status(200).json({ ...response.toObject(), flash: req.flash() });
};
