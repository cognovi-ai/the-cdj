import { validateAccount, validateLogin, validateRegistration } from '../../middleware/validation.js';

import { Router } from 'express';

import catchAsync from '../../utils/catchAsync.js';

import { accessController as controller } from '../../controllers/index.js';
import { isAuthenticated } from '../../middleware/access.js';

// root path: /access
const router = Router({ mergeParams: true });

router.route('/:journalId/account')
  .get(isAuthenticated, catchAsync(controller.getAccount))
  .put(isAuthenticated, validateAccount, catchAsync(controller.updateAccount))
  .delete(isAuthenticated, catchAsync(controller.deleteItem));

router.route('/login')
  .post(validateLogin, catchAsync(controller.login));

router.route('/forgot-password')
  .post(catchAsync(controller.forgotPassword));

router.route('/reset-password')
  .post(catchAsync(controller.resetPassword));

router.route('/logout')
  .get(isAuthenticated, controller.logout);

router.route('/register')
  .post(validateRegistration, catchAsync(controller.register));

export default router;
