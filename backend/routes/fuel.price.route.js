import express from 'express'
import { authenticate, isAdmin } from '../middlewares/authenticate.middleware.js';
import { createPrice, getCurrentPrices, getPriceHistory } from '../controllers/fuel.price.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { createPriceSchema } from '../validations/fuel.price.validation.js';
const router = express.Router();

router.get('/', authenticate, isAdmin, getCurrentPrices)

router.post('/',
    authenticate,
    isAdmin,
    validate(createPriceSchema),
    createPrice
)

router.get('/history',
    authenticate,
    isAdmin,
    getPriceHistory
)

export default router