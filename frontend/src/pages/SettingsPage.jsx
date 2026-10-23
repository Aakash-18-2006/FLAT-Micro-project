import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { regexService } from '../services/regexService';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { toggleTheme, isDark } = useTheme();
  const [historyCount, setHistoryCount] = useState(() => regexService.getHistoryCount());

  useEffect(() => {
    const updateCount = () => setHistoryCount(regexService.getHistoryCount());
    window.addEventListener('history:updated', updateCount);
    return () => window.removeEventListener('history:updated', updateCount);
  }, []);

  const handleClearHistory = () => {
    if (!confirm('Clear ALL your saved local test history? This action cannot be undone.')) return;
    try {
      regexService.clearAllHistory();
      setHistoryCount(0);
      toast.success('Local history cleared');
    } catch {
      toast.error('Failed to clear local history');
    }
  };

  return (
    <div className="page" style={{ maxWidth: '720px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Settings</h1>
          <p className="page-subtitle">Manage your preferences and local storage</p>
        </div>
      </div>

      {/* Appearance */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="settings-section-title">Appearance</div>

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">🎨 Theme</div>
            <div className="settings-row-desc">
              Currently: <strong>{isDark ? 'Dark' : 'Light'}</strong> mode
            </div>
          </div>
          <label className="toggle" aria-label="Toggle dark mode">
            <input type="checkbox" checked={isDark} onChange={toggleTheme} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      {/* Data Management */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="settings-section-title">Data & Storage</div>

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">🕐 Local Test History</div>
            <div className="settings-row-desc">
              {historyCount} saved test {historyCount === 1 ? 'record' : 'records'} stored locally in your browser
            </div>
          </div>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleClearHistory}
            disabled={historyCount === 0}
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Architecture & Engine Info */}
      <div className="card">
        <div className="settings-section-title">About</div>

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">⚡ RegexMind</div>
            <div className="settings-row-desc">
              FLAT Micro Project – Regular Expression Pattern Validator (Stateless Edition)
            </div>
          </div>
          <span className="badge badge-info">v1.0.0</span>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">🔬 Engine</div>
            <div className="settings-row-desc">
              Pure JavaScript RegExp execution engine (ECMA-262) with token analysis
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">🚀 Architecture</div>
            <div className="settings-row-desc">
              Stateless Node.js backend on Voroa + React frontend on Vercel
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
