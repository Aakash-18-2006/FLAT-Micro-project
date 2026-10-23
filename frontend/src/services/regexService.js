import api from './api';
import { historyService } from './historyService';

export const regexService = {
  /**
   * Test regex against multiple strings — real native engine on backend
   */
  async test(regex, flags, testStrings) {
    const { data } = await api.post('/regex/test', { regex, flags, testStrings });
    return data;
  },

  /**
   * Validate regex pattern syntax and retrieve token breakdown
   */
  async validate(regex, flags = '') {
    const { data } = await api.post('/regex/validate', { regex, flags });
    return data;
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
