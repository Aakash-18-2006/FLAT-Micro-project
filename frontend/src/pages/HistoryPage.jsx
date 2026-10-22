import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { regexService } from '../services/regexService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [deleting, setDeleting] = useState(null);

  const fetchHistory = useCallback(async (page = 1, q = search) => {
    setLoading(true);
    try {
      const data = await regexService.getHistory(page, 20, q);
      setRecords(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchHistory(1, '');
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory(1, search);
  };

  const deleteRecord = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this history record?')) return;
    setDeleting(id);
    try {
      await regexService.deleteHistory(id);
      setRecords((prev) => prev.filter((r) => r._id !== id));
      toast.success('Record deleted');
    } catch {
      toast.error('Failed to delete record');
    } finally {
      setDeleting(null);
    }
  };

  const clearAll = async () => {
    if (!confirm('Clear ALL history? This cannot be undone.')) return;
    try {
      const data = await regexService.clearAllHistory();
      setRecords([]);
      setPagination({ page: 1, pages: 1, total: 0 });
      toast.success(data.message);
    } catch {
      toast.error('Failed to clear history');
    }
  };

  const openRecord = (record) => {
    // Navigate to tester with this record loaded
    navigate('/', {
      state: {
        example: {
          regex: record.regex,
          flags: record.flags || '',
          matchingExample: record.testStrings[0] || '',
          nonMatchingExample: record.testStrings[1] || '',
          title: `History: /${record.regex}/`,
        },
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="page">
        <div className="empty-state" style={{ minHeight: '60vh' }}>
          <div className="empty-state-icon">🔒</div>
          <div className="empty-state-title">Sign In Required</div>
          <div className="empty-state-desc">
            Please sign in to view your test history.
          </div>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🕐 Test History</h1>
          <p className="page-subtitle">
            {pagination.total} saved test{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        {records.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={clearAll}>
            🗑️ Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <div className="search-input-wrap" style={{ flex: 1 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="form-input"
            placeholder="Search by regex pattern…"
            value={search}
            onChange={handleSearch}
            aria-label="Search history"
          />
        </div>
        <button type="submit" className="btn btn-secondary">Search</button>
        {search && (
          <button type="button" className="btn btn-ghost" onClick={() => { setSearch(''); fetchHistory(1, ''); }}>
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <div className="empty-state">
          <div style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }}>⚡</div>
          <div className="empty-state-title">Loading…</div>
        </div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">
            {search ? 'No matching history' : 'No history yet'}
          </div>
          <div className="empty-state-desc">
            {search ? 'Try a different search term.' : 'Start testing regex patterns to build your history.'}
          </div>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>
            ⚡ Start Testing
          </button>
        </div>
      ) : (
        <>
          <div className="history-list">
            {records.map((record) => (
              <HistoryItem
                key={record._id}
                record={record}
                onOpen={openRecord}
                onDelete={deleteRecord}
                isDeleting={deleting === record._id}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page === 1}
                onClick={() => fetchHistory(pagination.page - 1)}
              >
                ← Prev
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => fetchHistory(pagination.page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function HistoryItem({ record, onOpen, onDelete, isDeleting }) {
  const accepted = record.results?.filter((r) => r.accepted).length || 0;
  const total = record.results?.length || 0;

  return (
    <div
      className="history-item"
      onClick={() => onOpen(record)}
      role="button"
      tabIndex={0}
      aria-label={`Open test: /${record.regex}/`}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(record); }}
    >
      <div>
        <div className="history-regex">
          /{record.regex}/{record.flags}
        </div>
        <div className="history-meta">
          <span className="history-meta-item">
            📝 {total} string{total !== 1 ? 's' : ''} tested
          </span>
          <span className="history-meta-item">
            <span style={{ color: 'var(--success)' }}>✓ {accepted}</span>
            {' / '}
            <span style={{ color: 'var(--error)' }}>✗ {total - accepted}</span>
          </span>
          <span className="history-meta-item">
            🕐 {format(new Date(record.createdAt), 'MMM d, yyyy · h:mm a')}
          </span>
        </div>
      </div>

      <div className="history-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onOpen(record)}
          title="Open in tester"
          aria-label="Open in tester"
        >
          ↗ Open
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={(e) => onDelete(record._id, e)}
          disabled={isDeleting}
          title="Delete record"
          aria-label="Delete record"
        >
          {isDeleting ? '…' : '🗑️'}
        </button>
      </div>
    </div>
  );
}
