const { validationResult } = require('express-validator');
const { testMultipleStrings, compileRegex, breakdownPattern } = require('../services/regexEngine');

/**
 * POST /api/regex/test
 * Pure stateless regex testing using native JS RegExp engine
 */
const testRegex = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errList = errors.array();
      const firstMsg = errList[0]?.msg || 'Validation failed';
      return res.status(400).json({
        success: false,
        message: firstMsg,
        error: firstMsg,
        errors: errList,
      });
    }

    const { regex, flags = '', testStrings } = req.body;

    // Run the actual test using native regex engine with timing
    const engineResult = testMultipleStrings(regex, flags, testStrings);

    if (!engineResult.valid) {
      return res.status(400).json({
        success: false,
        message: engineResult.error || 'Invalid regular expression',
        error: engineResult.error || 'Invalid regular expression',
      });
    }

    // Parse syntax breakdown
    const breakdown = breakdownPattern(regex);

    res.json({
      success: true,
      regex,
      flags,
      breakdown,
      results: engineResult.results,
      summary: {
        total: engineResult.results.length,
        accepted: engineResult.results.filter((r) => r.accepted).length,
        rejected: engineResult.results.filter((r) => !r.accepted).length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/regex/validate
 * Pure stateless regex syntax validation & token breakdown
 */
const validateRegex = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errList = errors.array();
      const firstMsg = errList[0]?.msg || 'Validation failed';
      return res.status(400).json({
        success: false,
        valid: false,
        message: firstMsg,
        error: firstMsg,
        errors: errList,
      });
    }

    const { regex, flags = '' } = req.body;
    const { valid, error } = compileRegex(regex, flags);
    const breakdown = valid ? breakdownPattern(regex) : [];

    res.json({ success: true, valid, error, breakdown });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  testRegex,
  validateRegex,
};
