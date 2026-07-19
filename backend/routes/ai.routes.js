import express from 'express'
import { authenticate, isAdmin } from '../middlewares/authenticate.middleware.js'
import { chat } from '../controllers/ai.controller.js'

const router = express.Router()

router.post('/chat', authenticate, isAdmin, chat)

export default router