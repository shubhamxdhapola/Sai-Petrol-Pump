import express from 'express'
import nozzleRoutes from './nozzle.routes.js'
import validate from '../middlewares/validate.middleware.js';
import { authenticate, isAdmin } from '../middlewares/authenticate.middleware.js';
import { createMachineSchema, updateMachineSchema } from '../validations/machine.validation.js';
import { createMachine, deleteMachine, getMachine, getMachines, updateMachine } from '../controllers/machine.controller.js';

const router = express.Router();

router.get('/', authenticate, isAdmin, getMachines)
router.get('/:id', authenticate, isAdmin, getMachine)
router.delete('/:id', authenticate, isAdmin, deleteMachine)

router.post('/',
    authenticate,
    isAdmin,
    validate(createMachineSchema),
    createMachine
)

router.patch('/:id',
    authenticate,
    isAdmin,
    validate(updateMachineSchema),
    updateMachine
)

// Nested routes
router.use("/:machineId/nozzles", nozzleRoutes);

export default router;