import express from 'express'
import { authenticate, isAdmin } from '../middlewares/authenticate.js'
import { createTank, deleteTank, getTank, getTanks, updateTank } from '../controllers/tank.controller.js'
const router = express.Router()

router.get('/', authenticate, isAdmin, getTanks)
router.get('/:id', authenticate, isAdmin, getTank)
router.post('/', authenticate, isAdmin, createTank)
router.patch('/:id', authenticate, isAdmin, updateTank)
router.delete('/:id', authenticate, isAdmin, deleteTank)

export default router