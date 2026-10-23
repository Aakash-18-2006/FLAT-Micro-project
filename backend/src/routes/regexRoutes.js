const express = require('express');
const { body } = require('express-validator');
const { testRegex, validateRegex } = require('../controllers/regexController');

const router = express.Router();

// Test regex against test strings
router.post(
  '/test',
  [
    body('regex')
      .trim()
      .notEmpty()
      .withMessage('Regex pattern is required')
      .isLength({ max: 500 })
      .withMessage('Regex too long'),
    body('flags')
      .optional()
      .isString()
      .isLength({ max: 10 })
      .withMessage('Flags too long'),
    body('testStrings')
      .isArray({ min: 1, max: 50 })
      .withMessage('testStrings must be an array with 1–50 strings'),
    body('testStrings.*')
      .isString()
      .isLength({ max: 5000 })
      .withMessage('Each test string must be under 5000 characters'),
  ],
  testRegex
);

// Validate regex pattern syntax only
router.post(
  '/validate',
  [
    body('regex')
      .trim()
      .notEmpty()
      .withMessage('Regex pattern is required')
      .isLength({ max: 500 })
      .withMessage('Regex too long'),
    body('flags')
      .optional()
      .isString()
      .isLength({ max: 10 })
      .withMessage('Flags too long'),
  ],
  validateRegex
);

module.exports = router;
