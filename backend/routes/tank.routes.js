import express from 'express'
import { authenticate, isAdmin } from '../middlewares/authenticate.middleware.js'
import { createTank, deleteTank, getTank, getTanks, updateTank } from '../controllers/tank.controller.js'
import validate from '../middlewares/validate.middleware.js'
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

export default router