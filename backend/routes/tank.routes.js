import express from 'express'
import validate from '../middlewares/validate.middleware.js'
import refillRoutes from './tank.refill.routes.js'
import { authenticate, isAdmin } from '../middlewares/authenticate.middleware.js'
import { createTank, deleteTank, getTank, getTanks, updateTank } from '../controllers/tank.controller.js'
import { createTankSchema, updateTankSchema } from '../validations/tank.validation.js'

const router = express.Router()

router.get('/', authenticate, isAdmin, getTanks)
router.get('/:id', authenticate, isAdmin, getTank)
router.delete('/:id', authenticate, isAdmin, deleteTank)

router.post('/',
    authenticate,
    isAdmin,
    validate(createTankSchema),
    createTank
)

router.patch('/:id',
    authenticate,
    isAdmin,
    validate(updateTankSchema),
    updateTank
)

// Nested routes
router.use('/:tankId/refills', refillRoutes)

export default router