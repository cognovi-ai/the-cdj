import { Router } from 'express';

import catchAsync from '../../utils/catchAsync.js';

import { reportsController as controller } from '../../controllers/index.js';
import { isAuthenticated } from '../../middleware/access.js';

// root path: /journals/:journalId/reports
const router = Router({ mergeParams: true });

// Apply isAuthenticated middleware to all routes in this router
router.use(isAuthenticated);

/**
 * Report routes.
 */
router.route('/weekly')
  .get(catchAsync(controller.getWeeklyReport));

export default router;
