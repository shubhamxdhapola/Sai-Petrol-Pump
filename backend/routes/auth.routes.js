import express from 'express'
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { changePassword, getUserInfo, login, logout } from '../controllers/auth.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { changePasswordSchema, loginSchema } from '../validations/auth.validation.js';

const router = express.Router();

router.post('/logout', logout)
router.get('/get-user-info', authenticate, getUserInfo)

router.post('/login', 
    validate(loginSchema), 
    login
)

router.patch('/change-password', 
    authenticate, 
    validate(changePasswordSchema), 
    changePassword
)

export default router