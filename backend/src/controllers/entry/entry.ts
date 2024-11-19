import * as EntryServices from '../../models/services/entry/entry.js';
import { NextFunction, Request, Response } from 'express';
import { ChatMessage } from '../../models/entry/entryConversation.js';
import ExpressError from '../../utils/ExpressError.js';
import { Journal } from '../../models/index.js';

/**
 * Request body for create and update Entry operations,
 * i.e. all requests that go through validateEntry
 */
export interface UpdateEntryRequestBody {
  title?: string;
  content?: string;
  mood?: string;
  tags?: string[];
  privacy_settings?: {
    public: boolean;
    shared_with: string[];
  };
}

export interface UpdateChatRequestBody {
  messages: ChatMessage[];
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
  try {
    await EntryServices.deleteEntry(entryId);
    req.flash('success', 'Successfully deleted entry.');
    res.status(200).json({ flash: req.flash() });
  } catch (err) {
    const errMessage = (err as Error).message;
    if (errMessage === 'Entry not found.') {
      return next(new ExpressError((err as Error).message, 404));  
    }
    return next(new ExpressError('An error occurred while attempting to delete the entry.', 500));
  }
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

  try {
    const configId = await verifyJournalExists(journalId);

    try {
      const { errMessage, entry, entryAnalysis } = await EntryServices.updateEntryAnalysis(entryId, configId);
    
      if (errMessage) {
        req.flash('info', errMessage);
      }
      req.flash('success', 'Successfully generated a new analysis.');
      res
        .status(200)
        .json({
          ...entryAnalysis.toObject(),
          entry: entry.toObject(),
          flash: req.flash(),
        });
    } catch (updateError) {
      // Possible error from failing to find matching documents for entryId
      // Setting appropriate error code here
      throw new ExpressError((updateError as Error).message, 404);
    }
  } catch (error) {
    return next(error);
  }
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
  const messageData: UpdateChatRequestBody = req.body;

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
  const messageData: UpdateChatRequestBody = req.body;

  try {
    const configId = await verifyJournalExists(journalId);

    const response = await EntryServices.updateEntryConversation(chatId, configId, messageData);
    res.status(200).json({ ...response.toObject(), flash: req.flash() });
  } catch (error) {
    return next(error);
  }
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
