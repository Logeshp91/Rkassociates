import express from 'express';
import { body, param } from 'express-validator';
import { createUser, deleteUser, getUserById, getUsers, updateUser } from '../controllers/userController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(protect, requireAdmin);

router.post(
  '/',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be 3 to 30 characters')
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, dots, and dashes'),
    body('password')
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0
      })
      .withMessage('Password must be 8+ characters and include uppercase, lowercase, and a number'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Role must be admin or user')
  ],
  validateRequest,
  createUser
);

router.get('/', getUsers);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid user id')],
  validateRequest,
  getUserById
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid user id'),
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be 3 to 30 characters')
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, dots, and dashes'),
    body('password')
      .optional()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0
      })
      .withMessage('Password must be 8+ characters and include uppercase, lowercase, and a number'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Role must be admin or user')
  ],
  validateRequest,
  updateUser
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid user id')],
  validateRequest,
  deleteUser
);

export default router;
