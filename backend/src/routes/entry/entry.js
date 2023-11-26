import { validateEntry, validateEntryConversation } from '../../middleware/validation.js';

import { Router } from 'express';

import catchAsync from '../../utils/catchAsync.js';

import { entryController as controller } from '../../controllers/index.js';
import { isAuthenticated } from '../../middleware/access.js';

// root path: /journals/:journalId/entries
const router = Router({ mergeParams: true });

// Apply isAuthenticated middleware to all routes in this router
router.use(isAuthenticated);

/**
 * Entry routes.
 */
router.route('/')
  .get(catchAsync(controller.getAllEntries))
  .post(validateEntry, catchAsync(controller.createEntry));

router.route('/:entryId')
  .get(catchAsync(controller.getAnEntry))
  .put(validateEntry, catchAsync(controller.updateEntry))
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
  .post(validateEntryConversation, catchAsync(controller.createEntryConversation));

router.route('/:entryId/chat/:chatId')
  .put(validateEntryConversation, catchAsync(controller.updateEntryConversation));

export default router;
