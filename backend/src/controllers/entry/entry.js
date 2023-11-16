import { Entry, EntryAnalysis, EntryConversation } from '../../models/index.js';

// Get all entries for a specific journal
export const getAllEntries = async (journalId) => {
    return await Entry.find({ journal_id: journalId });
};

// Create a new entry in a specific journal
export const createEntry = async (journalId, entryData) => {
    const newEntry = new Entry({ journal_id: journalId, ...entryData });

    // TODO: Save a real analysis from CDGPT
    const newAnalysis = new EntryAnalysis({ entry_id: newEntry._id, analysis_content: `Analysis for entry ${ newEntry._id }` });

    newAnalysis.save();

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

// Get an entry and the analysis
export const getEntryAnalysis = async (entryId) => {
    const entry = await getAnEntry(entryId);
    const analysis = await EntryAnalysis.find({ entry_id: entryId });

    return { ...entry._doc, ...analysis[0]._doc };
}

// Get conversation associated with an entry
export const getEntryConversation = async (entryId) => {
    const response = await EntryConversation.findOne({ entry_id: entryId });
    const entryConversation = response ? { ...response._doc, chat_id: response._id } : {};

    return entryConversation;
}

// Create a new conversation for a specific entry
export const createEntryConversation = async (entryId, messageData) => {
    const response = new EntryConversation({
        entry_id: entryId,
        messages: [{
            message_content: messageData.message_content,
            llm_response: `Response from LLM to entry ${ entryId }`,
        }]
    });

    response.save();
    return await getEntryConversation(entryId);
};

// Update a conversation for a specific entry
export const updateEntryConversation = async (chatId, messageData) => {
    const response = await EntryConversation.findOneAndUpdate(
        { _id: chatId },
        {
            $push: {
                messages: [{
                    message_content: messageData.message_content,
                    llm_response: `Response from LLM to entry ${ chatId }`,
                }]
            }
        },
        { new: true }
    )

    return response;
};