import mongoose from 'mongoose';

import { Entry, EntryAnalysis, EntryConversation } from '../../models/index.js';
import ExpressError from '../../utils/ExpressError.js';

/**
 * Get all entries in a specific journal.
 */
export const getAllEntries = async (req, res) => {
    const { journalId } = req.params;

    const entries = await Entry.db.find({ journal: journalId });

    res.status(200).json({ entries: entries });
};

/**
 * Create a new entry and analysis in a specific journal.
 */
export const createEntry = async (req, res) => {
    /*
    TODO: ChatGPT should create the title for the entry, entry analysis, tags, and any additional data. The user should only provide the entry content.
    */
    const { journalId } = req.params;

    const entryData = req.body;

    const newEntry = new Entry.db({ journal: journalId, ...entryData });
    const newAnalysis = new EntryAnalysis({ entry: newEntry._id, analysis_content: `Analysis for entry ${ newEntry._id }` });

    await newAnalysis.save();

    res.status(201).json(await newEntry.save());
};

/**
 * Get an entry by ID.
 */
export const getAnEntry = async (req, res) => {
    const { entryId } = req.params;

    const entry = await Entry.db.findById(entryId);

    res.status(200).json(entry);
};

/**
 * Update an entry by ID.
 */
export const updateEntry = async (req, res) => {
    const { entryId } = req.params;

    const entryData = req.body;
    const updatedEntry = await Entry.db.findByIdAndUpdate(entryId, entryData, { new: true });

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
        await Entry.db.findByIdAndDelete(entryId, { session });

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
    const { entryId } = req.params;

    const entryAnalysis = await EntryAnalysis.findOne({ entry: entryId }).populate('entry');

    if (!entryAnalysis) {
        return next(new ExpressError('Entry analysis not found', 404));
    }

    res.status(200).json(entryAnalysis._doc);
}

/**
 * Get a conversation for a specific entry.
 */
export const getEntryConversation = async (req, res) => {
    const { entryId } = req.params;

    const response = await EntryConversation.findOne({ entry: entryId });
    const entryConversation = response ? { ...response._doc, chatId: response._id } : {};

    res.status(200).json(entryConversation);
}

/**
 * Create a conversation for a specific entry.
 */
export const createEntryConversation = async (req, res) => {
    const { entryId } = req.params;
    const messageData = req.body;

    const newConversation = new EntryConversation({
        entry: entryId,
        messages: [{
            message_content: messageData.message_content,
            llm_response: `Response from LLM to entry ${ entryId }`,
        }]
    });

    await newConversation.save();

    const response = await EntryConversation.findOne({ entry: entryId });
    const entryConversation = response ? response._doc : {};

    res.status(201).json(entryConversation);
};

/**
 * Update a conversation for a specific entry.
 */
export const updateEntryConversation = async (req, res) => {
    const { chatId, entryId } = req.params;
    const messageData = req.body;

    const response = await EntryConversation.findOneAndUpdate(
        { _id: chatId },
        {
            $push: {
                messages: [{
                    message_content: messageData.message_content,
                    llm_response: `Response from LLM to entry ${ entryId }`,
                }]
            }
        },
        { new: true }
    )

    res.status(200).json(response);
};