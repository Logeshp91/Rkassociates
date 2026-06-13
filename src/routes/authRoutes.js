import express from 'express';
import { body } from 'express-validator';
import { forgotPassword, getMe, login, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.post(
  '/login',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be 3 to 30 characters')
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, dots, and dashes'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  validateRequest,
  login
);

router.get('/me', protect, getMe);

router.post(
  '/forgot-password',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be 3 to 30 characters')
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, dots, and dashes')
  ],
  validateRequest,
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be 3 to 30 characters')
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, dots, and dashes'),
    body('otp')
      .trim()
      .matches(/^\d{6}$/)
      .withMessage('OTP must be exactly 6 digits'),
    body('password')
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0
      })
      .withMessage('Password must be 8+ characters and include uppercase, lowercase, and a number'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Confirm password must match new password')
  ],
  validateRequest,
  resetPassword
);

export default router;
