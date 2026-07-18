import express from 'express'
import { authenticate, isAdmin } from '../middlewares/authenticate.middleware.js';
import { getDashboardData } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/', authenticate, isAdmin, getDashboardData)

export default router;