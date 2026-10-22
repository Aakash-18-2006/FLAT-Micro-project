import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Tester', icon: '⚡' },
    { to: '/playground', label: 'Playground', icon: '🎮' },
    { to: '/examples', label: 'Examples', icon: '📚' },
    { to: '/learn', label: 'Learn', icon: '🎓' },
    { to: '/history', label: 'History', icon: '🕐' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo">
          <div className="logo-icon">⚡</div>
          <span className="logo-text">RegexMind</span>
        </NavLink>

        {/* Nav Links */}
        <ul className="navbar-nav">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span>{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button
            className="icon-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="user-menu" ref={dropRef}>
              <button
                className="user-btn"
                onClick={() => setDropdownOpen((p) => !p)}
                aria-label="User menu"
              >
                <div className="user-avatar">{user?.username?.[0] || 'U'}</div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.username}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>▼</span>
              </button>

              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-username">{user?.username}</div>
                    <div className="dropdown-email">{user?.email}</div>
                  </div>
                  <NavLink to="/history" onClick={() => setDropdownOpen(false)}>
                    <div className="dropdown-item">🕐 History</div>
                  </NavLink>
                  <NavLink to="/settings" onClick={() => setDropdownOpen(false)}>
                    <div className="dropdown-item">⚙️ Settings</div>
                  </NavLink>
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <NavLink to="/login">
                <button className="btn btn-secondary btn-sm">Log In</button>
              </NavLink>
              <NavLink to="/register">
                <button className="btn btn-primary btn-sm">Sign Up</button>
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
