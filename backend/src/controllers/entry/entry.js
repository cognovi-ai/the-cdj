import { Entry } from '../../models/index.js'; // Import your Entry model

// Get all entries for a specific journal
export const getAllEntries = async (journalId) => {
    return await Entry.find({ journal_id: journalId });
};

// Create a new entry in a specific journal
export const createEntry = async (journalId, entryData) => {
    const newEntry = new Entry({ journal_id: journalId, ...entryData });
    return await newEntry.save();
};

// Get an entry
export const getAnEntry = async (entryId) => {
    return await Entry.findById(entryId);
};

// Update an entry by ID
export const updateEntry = async (entryId, entryData) => {
    return await Entry.findByIdAndUpdate(entryId, entryData, { new: true });
};

// Delete an entry by ID
export const deleteEntry = async (entryId) => {
    return await Entry.findByIdAndDelete(entryId);
};
