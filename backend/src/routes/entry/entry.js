import { Router } from 'express';
const router = Router();
import { Entry } from '../../models/index.js'; // Import your Entry model

// Get all entries for a specific journal
router.get("/journals/:journalId/entries", async (req, res) => {
    try {
        const journalId = req.params.journalId;

        // Query the database to find entries with the specified journal_id
        const entries = await Entry.find({ journal_id: journalId });

        res.status(200).json({ entries: entries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Create a new entry in a specific journal
router.post('/journals/:journalId/entries', async (req, res) => {
    try {
        const journalId = req.params.journalId; // Extract journalId from URL params
        const { title, content, mood, tags, privacy_settings } = req.body;

        // Create a new entry using the Entry model and the provided journalId
        const newEntry = new Entry({
            journal_id: journalId, // Use the extracted journalId
            title,
            content,
            mood,
            tags,
            privacy_settings,
        });

        // Save the new entry to the database
        const savedEntry = await newEntry.save();

        res.status(201).json(savedEntry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update an entry by ID
router.put('/journals/:journalId/entries/:entryId', async (req, res) => {
    try {
        const entryId = req.params.entryId; // Extract entryId from URL params
        const { title, content, mood, tags, privacy_settings } = req.body;

        // Find the entry by ID and update its fields
        const updatedEntry = await Entry.findByIdAndUpdate(
            entryId,
            {
                title,
                content,
                mood,
                tags,
                privacy_settings,
            },
            { new: true } // Return the updated entry
        );

        if (!updatedEntry) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.status(200).json(updatedEntry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete an entry by ID
router.delete('/journals/:journalId/entries/:entryId', async (req, res) => {
    try {
        const entryId = req.params.entryId;

        // Find the entry by ID and remove it from the database
        const deletedEntry = await Entry.findByIdAndDelete(entryId);

        if (!deletedEntry) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.status(204).send(); // No content response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;