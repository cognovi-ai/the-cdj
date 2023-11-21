import { Router } from 'express';
import { accessController as controller } from '../../controllers/index.js';

import catchAsync from '../../utils/catchAsync.js';

// root path: /access
const router = Router({ mergeParams: true });

router.route('/login')
    .post(catchAsync(controller.login));

router.route('/register')
    .post(catchAsync(controller.register));

export default router;