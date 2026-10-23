import { NavLink } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

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
        </div>
      </div>
    </nav>
  );
}
