const STORAGE_KEY = 'regexmind_local_history';
const MAX_SAVED_RECORDS = 50;

/**
 * Helper to safely read from localStorage
 */
function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read regex history from localStorage:', err);
    return [];
  }
}

/**
 * Helper to safely write to localStorage
 */
function writeStorage(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent('history:updated'));
  } catch (err) {
    console.error('Failed to write regex history to localStorage:', err);
  }
}

export const historyService = {
  /**
   * Get paginated local history with search
   */
  getHistory(page = 1, limit = 20, search = '') {
    const records = readStorage();
    const query = (search || '').trim().toLowerCase();

    const filtered = query
      ? records.filter((r) =>
          (r.regex && r.regex.toLowerCase().includes(query)) ||
          (r.flags && r.flags.toLowerCase().includes(query)) ||
          (r.notes && r.notes.toLowerCase().includes(query)) ||
          (r.testStrings && r.testStrings.some((s) => s.toLowerCase().includes(query)))
        )
      : records;

    const total = filtered.length;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const pages = Math.max(1, Math.ceil(total / limitNum));
    const skip = (pageNum - 1) * limitNum;

    const pagedRecords = filtered.slice(skip, skip + limitNum);

    return {
      success: true,
      data: pagedRecords,
      pagination: {
        total,
        page: pageNum,
        pages,
        limit: limitNum,
      },
    };
  },

  /**
   * Add a test result to local history
   */
  addRecord({ regex, flags = '', testStrings = [], results = [], summary = null, notes = '' }) {
    if (!regex) return null;

    const records = readStorage();
    const newRecord = {
      _id: 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      regex,
      flags,
      testStrings,
      results,
      summary: summary || {
        total: results.length,
        accepted: results.filter((r) => r.accepted).length,
        rejected: results.filter((r) => !r.accepted).length,
      },
      notes,
      createdAt: new Date().toISOString(),
    };

    const updated = [newRecord, ...records].slice(0, MAX_SAVED_RECORDS);
    writeStorage(updated);
    return newRecord;
  },

  /**
   * Delete a record by ID
   */
  deleteRecord(id) {
    const records = readStorage();
    const filtered = records.filter((r) => r._id !== id);
    writeStorage(filtered);
    return { success: true, message: 'Record deleted.' };
  },

  /**
   * Clear all local history
   */
  clearHistory() {
    writeStorage([]);
    return { success: true, message: 'All local history cleared.' };
  },

  /**
   * Get total count of saved history records
   */
  getCount() {
    return readStorage().length;
  },
};
