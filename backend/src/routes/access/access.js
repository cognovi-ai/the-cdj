import { validateLogin, validateRegistration } from '../../middleware/validation.js';

import { Router } from 'express';

import catchAsync from '../../utils/catchAsync.js';

import { accessController as controller } from '../../controllers/index.js';
import { isAuthenticated } from '../../middleware/access.js';

// root path: /access
const router = Router({ mergeParams: true });

router.route('/:journalId/account')
  .get(isAuthenticated, catchAsync(controller.getAccount))
  .put(isAuthenticated, catchAsync(controller.updateAccount));

router.route('/login')
  .post(validateLogin, catchAsync(controller.login));

router.route('/logout')
  .get(isAuthenticated, controller.logout);

router.route('/register')
  .post(validateRegistration, catchAsync(controller.register));

export default router;
