import express from 'express'
import { authenticate, isAdmin } from '../middlewares/authenticate.js';
import { createPrice, getCurrentPrices, getPriceHistory } from '../controllers/fuel.price.controller.js';
const router = express.Router();

router.get('/', authenticate, isAdmin, getCurrentPrices)
router.post('/', authenticate, isAdmin, createPrice)
router.get('/history', authenticate, isAdmin, getPriceHistory)

export default router