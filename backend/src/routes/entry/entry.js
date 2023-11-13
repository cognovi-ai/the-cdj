import { Router } from 'express';
const router = Router();
import { entryController } from '../../controllers/index.js';

router.get("/journals/:journalId/entries", async (req, res) => {
    try {
        const entries = await entryController.getAllEntries(req.params.journalId);
        res.status(200).json({ entries: entries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post('/journals/:journalId/entries', async (req, res) => {
    try {
        const savedEntry = await entryController.createEntry(req.params.journalId, req.body);
        res.status(201).json(savedEntry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/journals/:journalId/entries/:entryId', async (req, res) => {
    try {
        const updatedEntry = await entryController.updateEntry(req.params.entryId, req.body);
        if (!updatedEntry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.status(200).json(updatedEntry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/journals/:journalId/entries/:entryId', async (req, res) => {
    try {
        const deletedEntry = await entryController.deleteEntry(req.params.entryId);
        if (!deletedEntry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
