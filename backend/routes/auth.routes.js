import express from 'express'
import { authenticate } from '../middlewares/authenticate.js';
import { changePassword, getUserInfo, login, logout } from '../controllers/auth.controller.js';
const router = express.Router();

router.post('/login', login)
router.post('/logout', logout)
router.get('/get-user-info', authenticate,  getUserInfo)
router.patch('/change-password', authenticate, changePassword)

export default router