const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  input: { type: String, required: true },
  accepted: { type: Boolean, required: true },
  matchedPortion: { type: String, default: null },
  matchStart: { type: Number, default: null },
  matchEnd: { type: Number, default: null },
  executionTimeMs: { type: Number, default: 0 },
});

const regexHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    regex: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    flags: {
      type: String,
      default: '',
      maxlength: 10,
    },
    testStrings: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length > 0 && arr.length <= 50;
        },
        message: 'Must have 1–50 test strings',
      },
    },
    results: [resultSchema],
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user history queries
regexHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('RegexHistory', regexHistorySchema);
