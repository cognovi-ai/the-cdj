import { Router } from 'express';
import { entryController as controller } from '../../controllers/index.js';

import catchAsync from '../../utils/catchAsync.js';

// root path: /journals/:journalId/entries
const router = Router({ mergeParams: true });

/**
 * Entry routes.
 */
router.route("/")
    .get(catchAsync(controller.getAllEntries))
    .post(catchAsync(controller.createEntry));

router.route('/:entryId')
    .get(catchAsync(controller.getAnEntry))
    .put(catchAsync(controller.updateEntry))
    .delete(catchAsync(controller.deleteEntry));

/**
 * Entry analysis routes.
 */
router.route('/:entryId/analysis')
    .get(catchAsync(controller.getEntryAnalysis));

/**
 * Entry conversation routes.
 */
router.route('/:entryId/chat')
    .get(catchAsync(controller.getEntryConversation))
    .post(catchAsync(controller.createEntryConversation));

router.route('/:entryId/chat/:chatId')
    .put(catchAsync(controller.updateEntryConversation));

export default router;
