import * as EntryServices from '../../models/services/entry/entry.js';
import {
  Entry,
  EntryAnalysis,
  EntryConversation,
  Journal,
} from '../../models/index.js';
import { NextFunction, Request, Response } from 'express';
import ExpressError from '../../utils/ExpressError.js';
import mongoose from 'mongoose';

/**
 * Request body for create and update Entry operations,
 * i.e. all requests that go through validateEntry
 */
export interface UpdateEntryRequestBody {
  title: string;
  content?: string;
  mood?: string;
  tags?: string[];
  privacy_settings?: {
    public: boolean;
    shared_swith: string[];
  };
}

/**
 * Get all entries in a specific journal.
 */
export const getAllEntries = async (
  req: Request,
  res: Response
) => {
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
export const createEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { journalId } = req.params;
  const entryData: UpdateEntryRequestBody = req.body;

  try {
    const configId = await verifyJournalExists(journalId);

    const { errMessage, entry: newEntry } = await EntryServices.createEntry(
      journalId,
      configId,
      entryData
    );
  
    if (errMessage) {
      req.flash('info', errMessage);
    }
    res.status(201).json({ ...newEntry.toObject(), flash: req.flash() });
  } catch (err) {
    return next(err);
  }
};

/**
 * Get an entry and all associated documents by ID.
 */
export const getAnEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
export const updateEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { entryId, journalId } = req.params;
  const entryData: UpdateEntryRequestBody = req.body;

  try {
    const configId = await verifyJournalExists(journalId);

    try {
      const { errMessage, entry: updatedEntry } = await EntryServices
        .updateEntry(
          entryId,
          configId,
          entryData,
        );
  
      if (errMessage) {
        req.flash('info', errMessage);
      }
      req.flash('success', 'Successfully updated entry.');
      res.status(200).json({ ...updatedEntry.toObject(), flash: req.flash() });
    } catch (updateError) {
      // Possible error from failing to find matching documents for entryId
      // Setting appropriate error code here
      throw new ExpressError((updateError as Error).message, 404);
    }
  } catch (err) {
    return next(err);
  }
};

/**
 * Delete an entry by ID and all associated documents.
 */
export const deleteEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
export const getEntryAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { entryId } = req.params;

  const entryAnalysis = await EntryServices.getPopulatedEntryAnalysis(entryId);

  if (!entryAnalysis) {
    return next(new ExpressError('Entry analysis not found.', 404));
  }

  res.status(200).json(entryAnalysis.toObject());
};

/**
 * Update the analysis of an entry by entry ID.
 */
export const updateEntryAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    .json({
      ...entryAnalysis.toObject(),
      entry: entry.toObject(),
      flash: req.flash(),
    });
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
export const createEntryConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { entryId, journalId } = req.params;
  const messageData = req.body;

  // Create new EntryConversation
  try {
    const configId = await verifyJournalExists(journalId);

    const response = await EntryServices.createEntryConversation(
      entryId,
      configId,
      messageData
    );

    // Craft response body
    const entryConversation = response ? response.toObject() : {};
    req.flash('success', 'Successfully created conversation.');
    res.status(201).json({ ...entryConversation, flash: req.flash() });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update a conversation for a specific entry.
 */
export const updateEntryConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    return next(
      new ExpressError('Entry conversation messages not found.', 404)
    );
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

/**
 * Checks if journal with jounalId exists and returns configId in journal.
 * 
 * @param journalId id of journal to check
 * @returns configId
 */
async function verifyJournalExists(journalId: string): Promise<string> {
  const journal = await Journal.findById(journalId);
  if (!journal) {
    throw new ExpressError('Journal not found.', 404);
  }
  if (!journal.config) {
    throw new ExpressError('Journal config not found.', 404);
  }
  return journal.config.toString();
}
