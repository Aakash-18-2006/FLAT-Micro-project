import api from './api';
import { historyService } from './historyService';
import { compileRegex, testMultipleStrings, breakdownPattern } from './regexEngine';

export const regexService = {
  /**
   * Test regex against multiple strings.
   * Tries backend API first; falls back to local JS RegExp engine on network/server errors.
   */
  async test(regex, flags = '', testStrings = []) {
    try {
      const { data } = await api.post('/regex/test', { regex, flags, testStrings });
      return data;
    } catch (err) {
      // If the backend actively rejected with a 400 (e.g. invalid regex syntax), respect that error
      if (err.response && err.response.status === 400) {
        throw err;
      }

      // On network failure, timeout, CORS error, or 5xx, execute with native engine
      console.warn('Backend API unavailable. Using native browser RegExp engine:', err.userMessage || err.message);
      const localResult = testMultipleStrings(regex, flags, testStrings);

      if (!localResult.valid) {
        const error = new Error(localResult.error || 'Invalid regular expression');
        error.userMessage = localResult.error || 'Invalid regular expression';
        throw error;
      }

      const breakdown = breakdownPattern(regex);

      return {
        success: true,
        regex,
        flags,
        breakdown,
        results: localResult.results,
        summary: {
          total: localResult.results.length,
          accepted: localResult.results.filter((r) => r.accepted).length,
          rejected: localResult.results.filter((r) => !r.accepted).length,
        },
        source: 'local',
      };
    }
  },

  /**
   * Validate regex pattern syntax and retrieve token breakdown.
   */
  async validate(regex, flags = '') {
    try {
      const { data } = await api.post('/regex/validate', { regex, flags });
      return data;
    } catch {
      // Fall back to local validation
      const { valid, error } = compileRegex(regex, flags);
      const breakdown = valid ? breakdownPattern(regex) : [];
      return { success: true, valid, error, breakdown };
    }
  },

  /**
   * Get paginated local history with search
   */
  async getHistory(page = 1, limit = 20, search = '') {
    return historyService.getHistory(page, limit, search);
  },

  /**
   * Delete a single history record from localStorage
   */
  async deleteHistory(id) {
    return historyService.deleteRecord(id);
  },

  /**
   * Clear all local history from localStorage
   */
  async clearAllHistory() {
    return historyService.clearHistory();
  },

  /**
   * Save a test run to localStorage history
   */
  saveToLocalHistory({ regex, flags, testStrings, results, summary }) {
    return historyService.addRecord({ regex, flags, testStrings, results, summary });
  },

  /**
   * Get total count of saved local history records
   */
  getHistoryCount() {
    return historyService.getCount();
  },
};
