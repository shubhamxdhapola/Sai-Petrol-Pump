import express from 'express'
import { authenticate, isAdmin } from '../middlewares/authenticate.middleware.js';
import { endShift, getShift, getShifts, startShift } from '../controllers/shift.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { endShiftSchema, startShiftSchema } from '../validations/shift.validation.js';

const router = express.Router();

router.get('/', authenticate, getShifts)
router.get('/:id', authenticate, getShift)
router.post('/', authenticate, validate(startShiftSchema), startShift)
router.post('/:id/end', authenticate, validate(endShiftSchema), endShift)

export default router