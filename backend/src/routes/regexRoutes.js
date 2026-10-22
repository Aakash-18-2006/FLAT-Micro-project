const express = require('express');
const { body } = require('express-validator');
const {
  testRegex,
  validateRegex,
  getHistory,
  getHistoryById,
  deleteHistoryById,
  clearAllHistory,
} = require('../controllers/regexController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Optional auth middleware — attaches user if token present, does not fail if missing
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-passwordHash');
  } catch (_) {
    // ignore invalid token for optional auth
  }
  next();
};

// Test regex (saves to history if authenticated)
router.post(
  '/test',
  optionalAuth,
  [
    body('regex').trim().notEmpty().withMessage('Regex pattern is required').isLength({ max: 500 }).withMessage('Regex too long'),
    body('flags').optional().isString().isLength({ max: 10 }).withMessage('Flags too long'),
    body('testStrings')
      .isArray({ min: 1, max: 50 })
      .withMessage('testStrings must be an array with 1–50 strings'),
    body('testStrings.*').isString().isLength({ max: 5000 }).withMessage('Each test string must be under 5000 characters'),
  ],
  testRegex
);

// Validate regex pattern only
router.post(
  '/validate',
  [
    body('regex').trim().notEmpty().withMessage('Regex pattern is required').isLength({ max: 500 }).withMessage('Regex too long'),
    body('flags').optional().isString().isLength({ max: 10 }).withMessage('Flags too long'),
  ],
  validateRegex
);

// History routes (require authentication)
router.get('/history', authenticate, getHistory);
router.get('/history/:id', authenticate, getHistoryById);
router.delete('/history/:id', authenticate, deleteHistoryById);
router.delete('/history', authenticate, clearAllHistory);

module.exports = router;
