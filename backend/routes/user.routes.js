import express from 'express'
import { authenticate, isAdmin } from '../middlewares/authenticate.middleware.js';
import { createUser, deleteUser, getUser, getUsers, updateUser } from '../controllers/user.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { createUserSchema, updateUserSchema } from '../validations/user.validation.js';
const router = express.Router();

router.get('/', authenticate, isAdmin, getUsers)
router.get('/:id', authenticate, isAdmin, getUser)
router.delete('/:id', authenticate, isAdmin, deleteUser)

router.post('/', 
    authenticate, 
    isAdmin, 
    validate(createUserSchema), 
    createUser
)
router.patch('/:id', 
    authenticate, 
    isAdmin, 
    validate(updateUserSchema), 
    updateUser
)

export default router