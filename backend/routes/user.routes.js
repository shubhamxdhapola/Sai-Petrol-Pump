import express from 'express'
import { authenticate, isAdmin } from '../middlewares/authenticate.js';
import { createUser, deleteUser, getUser, getUsers, updateUser } from '../controllers/user.controller.js';
const router = express.Router();

router.get('/', authenticate, isAdmin, getUsers)
router.post('/', authenticate, isAdmin, createUser)
router.get('/:id', authenticate, isAdmin, getUser)
router.patch('/:id', authenticate, isAdmin, updateUser)
router.delete('/:id', authenticate, isAdmin, deleteUser)

export default router