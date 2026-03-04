const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  logout,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

router.post(
  '/register',
  validate([
    body('fullName')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Full name must be at least 2 characters long'),
    body('nationalId')
      .matches(/^[A-Z]{2}[0-9]{14}$/)
      .withMessage('Invalid National ID format'),
    body('phone')
      .matches(/^(\+256|0)[0-9]{9}$/)
      .withMessage('Invalid phone number format'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    body('username')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character'),
    body('role')
      .isIn(['director', 'manager', 'sales-agent'])
      .withMessage('Role must be director, manager, or sales-agent'),
    body('branch')
      .optional()
      .isIn(['Maganjo', 'Matugga'])
      .withMessage('Branch must be either Maganjo or Matugga')
  ]),
  register
);

router.post(
  '/login',
  validate([
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ]),
  login
);

router.get('/me', protect, getMe);

router.post('/logout', protect, logout);

router.put(
  '/updatepassword',
  protect,
  validate([
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
  ]),
  updatePassword
);

module.exports = router;
