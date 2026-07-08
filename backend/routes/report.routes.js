import express from 'express'
import { authenticate, isAdmin } from '../middlewares/authenticate.middleware.js';
import { getRefillReport, getSalesReport } from '../controllers/report.controller.js';
const router = express.Router();

router.get('/sales', authenticate, isAdmin, getSalesReport)
router.get('/refills', authenticate, isAdmin, getRefillReport)

export default router;