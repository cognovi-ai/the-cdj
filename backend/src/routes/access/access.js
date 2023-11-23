import { Router } from 'express';
import { accessController as controller } from '../../controllers/index.js';

import { validateLogin, validateRegistration } from '../../middleware/validation.js';

import catchAsync from '../../utils/catchAsync.js';

// root path: /access
const router = Router({ mergeParams: true });

router.route('/login')
    .post(validateLogin, catchAsync(controller.login));

router.route('/register')
    .post(validateRegistration, catchAsync(controller.register));

export default router;