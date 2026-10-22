import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { regexService } from '../services/regexService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const handleClearHistory = async () => {
    if (!confirm('Clear ALL your test history? This action cannot be undone.')) return;
    try {
      const data = await regexService.clearAllHistory();
      toast.success(data.message || 'History cleared');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clear history');
    }
  };

  return (
    <div className="page" style={{ maxWidth: '720px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Settings</h1>
          <p className="page-subtitle">Manage your preferences and account</p>
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

      {/* Account */}
      {isAuthenticated ? (
        <>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="settings-section-title">Account Information</div>

            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">👤 Username</div>
                <div className="settings-row-desc font-mono">{user?.username}</div>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">📧 Email</div>
                <div className="settings-row-desc">{user?.email}</div>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">📅 Member Since</div>
                <div className="settings-row-desc">
                  {user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="settings-section-title">Data Management</div>

            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">🕐 Test History</div>
                <div className="settings-row-desc">
                  Permanently delete all your saved regex tests
                </div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={handleClearHistory}>
                Clear History
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card" style={{ borderColor: 'rgba(239,68,68,0.25)' }}>
            <div className="settings-section-title" style={{ color: 'var(--error)' }}>Session</div>

            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">🚪 Sign Out</div>
                <div className="settings-row-desc">Sign out of your account on this device</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <div className="empty-state-icon">🔒</div>
            <div className="empty-state-title">Not Signed In</div>
            <div className="empty-state-desc">Sign in to manage account settings and history.</div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/login')}>Log In</button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>Create Account</button>
            </div>
          </div>
        </div>
      )}

      {/* About */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="settings-section-title">About</div>
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">⚡ RegexMind</div>
            <div className="settings-row-desc">
              Regular Expression Pattern Validator — Built with React + Node.js + MongoDB
            </div>
          </div>
          <span className="badge badge-info">v1.0.0</span>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">🔬 Engine</div>
            <div className="settings-row-desc">
              JavaScript native RegExp engine (ECMA-262)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
