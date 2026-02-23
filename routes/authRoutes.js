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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - nationalId
 *               - phone
 *               - email
 *               - username
 *               - password
 *               - role
 *               - branch
 *             properties:
 *               fullName:
 *                 type: string
 *               nationalId:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [manager, sales-agent]
 *               branch:
 *                 type: string
 *                 enum: [Maganjo, Matugga]
 */
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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 */
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

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged in user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout', protect, logout);

/**
 * @swagger
 * /api/auth/updatepassword:
 *   put:
 *     summary: Update user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 */
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
