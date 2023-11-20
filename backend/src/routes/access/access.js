import { Router } from 'express';
import { accessController as controller } from '../../controllers/index.js';

import catchAsync from '../../utils/catchAsync.js';

// root path: /access
const router = Router({ mergeParams: true });

export default router;