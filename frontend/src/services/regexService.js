import api from './api';

export const regexService = {
  /**
   * Test regex against multiple strings — real engine, no mocking
   */
  async test(regex, flags, testStrings, saveToHistory = true) {
    const { data } = await api.post('/regex/test', { regex, flags, testStrings, saveToHistory });
    return data;
  },

  /**
   * Validate regex pattern syntax only
   */
  async validate(regex, flags = '') {
    const { data } = await api.post('/regex/validate', { regex, flags });
    return data;
  },

  /**
   * Get paginated history for the authenticated user
   */
  async getHistory(page = 1, limit = 20, search = '') {
    const { data } = await api.get('/regex/history', { params: { page, limit, search } });
    return data;
  },

  /**
   * Get a single history record by ID
   */
  async getHistoryById(id) {
    const { data } = await api.get(`/regex/history/${id}`);
    return data;
  },

  /**
   * Delete a single history record
   */
  async deleteHistory(id) {
    const { data } = await api.delete(`/regex/history/${id}`);
    return data;
  },

  /**
   * Clear all history for the current user
   */
  async clearAllHistory() {
    const { data } = await api.delete('/regex/history');
    return data;
  },
};
