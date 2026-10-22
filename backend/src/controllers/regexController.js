const { validationResult } = require('express-validator');
const RegexHistory = require('../models/RegexHistory');
const { testMultipleStrings, compileRegex, breakdownPattern } = require('../services/regexEngine');

/**
 * POST /api/regex/test
 * Test strings against a regex and save to history
 */
const testRegex = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { regex, flags = '', testStrings, saveToHistory = true } = req.body;

    // Run the actual test using real regex engine
    const engineResult = testMultipleStrings(regex, flags, testStrings);

    if (!engineResult.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid regular expression',
        error: engineResult.error,
      });
    }

    // Parse breakdown
    const breakdown = breakdownPattern(regex);

    // Save to history if user is authenticated and saveToHistory is true
    let historyId = null;
    if (req.user && saveToHistory) {
      const historyRecord = await RegexHistory.create({
        userId: req.user._id,
        regex,
        flags,
        testStrings,
        results: engineResult.results,
      });
      historyId = historyRecord._id;
    }

    res.json({
      success: true,
      regex,
      flags,
      breakdown,
      results: engineResult.results,
      historyId,
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
 * Just validate the regex pattern without testing strings
 */
const validateRegex = async (req, res, next) => {
  try {
    const { regex, flags = '' } = req.body;
    const { valid, error } = compileRegex(regex, flags);
    const breakdown = valid ? breakdownPattern(regex) : [];

    res.json({ success: true, valid, error, breakdown });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/history
 */
const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = { userId: req.user._id };
    if (search) {
      query.regex = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const [records, total] = await Promise.all([
      RegexHistory.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      RegexHistory.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/history/:id
 */
const getHistoryById = async (req, res, next) => {
  try {
    const record = await RegexHistory.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!record) {
      return res.status(404).json({ success: false, message: 'History record not found.' });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/history/:id
 */
const deleteHistoryById = async (req, res, next) => {
  try {
    const record = await RegexHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'History record not found.' });
    }

    res.json({ success: true, message: 'History record deleted.' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/history
 * Clear all history for the authenticated user
 */
const clearAllHistory = async (req, res, next) => {
  try {
    const result = await RegexHistory.deleteMany({ userId: req.user._id });
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} history record(s).`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  testRegex,
  validateRegex,
  getHistory,
  getHistoryById,
  deleteHistoryById,
  clearAllHistory,
};
