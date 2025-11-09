import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ClientTopNav.css';

// Premium Icons
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 1v6m0 6v6m8.66-15l-3 5.2M6.34 8.8l-3 5.2m12.728 0l3 5.2M6.34 15.2l-3-5.2"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export const ClientTopNav = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', badge: null },
    { text: 'Projets', icon: <FolderIcon />, path: '/projects', badge: null },
    { text: 'Profil', icon: <PersonIcon />, path: '/profile', badge: null },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const userDisplayName = user?.full_name || user?.email || 'User';
  const userRole = user?.user_roles?.[0]?.role?.role_identity || 'client_previx';

  const getRoleLabel = () => {
    if (userRole === 'general_admin') return 'Admin';
    if (userRole === 'user_previx') return 'Collab';
    return 'Client';
  };

  const getRoleColor = () => {
    if (userRole === 'general_admin') return 'admin';
    if (userRole === 'user_previx') return 'collab';
    return 'client';
  };

  return (
    <header className={`premium-topnav ${scrolled ? 'scrolled' : ''}`}>
      {/* Animated gradient background */}
      <div className="topnav-gradient-bg"></div>
      <div className="topnav-mesh-gradient"></div>

      <div className="topnav-container">
        {/* Logo with animation */}
        <div className="topnav-logo-section">
          <div className="logo-wrapper">
            <div className="logo-icon-ring"></div>
            <h1 className="premium-logo" onClick={() => navigate('/dashboard')}>
              <span className="logo-prev">Prev</span>
              <span className="logo-dash">-</span>
              <span className="logo-ix">IX</span>
            </h1>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="premium-nav-menu">
          {menuItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`premium-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigate(item.path)}
            >
              <div className="nav-item-bg"></div>
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.text}</span>
              {item.badge && <span className="nav-item-badge">{item.badge}</span>}
              <div className="nav-item-shine"></div>
            </button>
          ))}
        </nav>

        {/* Actions Section */}
        <div className="topnav-actions-section">
          {/* Search Button */}
          <div className="search-wrapper" ref={searchRef}>
            <button 
              type="button"
              className="action-button search-btn"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <SearchIcon />
              <span className="action-tooltip">Rechercher</span>
            </button>
            
            {searchOpen && (
              <div className="search-dropdown">
                <div className="search-input-wrapper">
                  <SearchIcon />
                  <input 
                    type="text" 
                    placeholder="Rechercher..."
                    className="search-input"
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button type="button" className="action-button notification-btn">
            <BellIcon />
            <span className="notification-dot"></span>
            <span className="action-tooltip">Notifications</span>
          </button>

          {/* User Menu */}
          <div className="user-menu-wrapper" ref={userMenuRef}>
            <button 
              type="button"
              className="premium-user-button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="user-avatar-premium">
                <span className="avatar-text">{userDisplayName.charAt(0).toUpperCase()}</span>
                <div className="avatar-status"></div>
              </div>
              <div className="user-details">
                <span className="user-name-premium">{userDisplayName}</span>
                <span className={`user-role-premium ${getRoleColor()}`}>{getRoleLabel()}</span>
              </div>
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div className="premium-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {userDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="dropdown-user-info">
                    <div className="dropdown-name">{userDisplayName}</div>
                    <div className="dropdown-email">{user?.email}</div>
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => handleNavigate('/profile')}
                >
                  <PersonIcon />
                  <span>Mon Profil</span>
                </button>
                
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => handleNavigate('/settings')}
                >
                  <SettingsIcon />
                  <span>Paramètres</span>
                </button>
                
                <div className="dropdown-divider"></div>
                
                <button
                  type="button"
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <LogoutIcon />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="premium-mobile-menu">
          <div className="mobile-menu-header">
            <div className="mobile-user-card">
              <div className="mobile-avatar">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
              <div className="mobile-user-info">
                <div className="mobile-user-name">{userDisplayName}</div>
                <div className="mobile-user-email">{user?.email}</div>
              </div>
            </div>
          </div>

          <div className="mobile-menu-nav">
            {menuItems.map((item) => (
              <button
                key={item.path}
                type="button"
                className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNavigate(item.path)}
              >
                <span className="mobile-nav-icon">{item.icon}</span>
                <span className="mobile-nav-text">{item.text}</span>
                {item.badge && <span className="mobile-nav-badge">{item.badge}</span>}
              </button>
            ))}
          </div>

          <div className="mobile-menu-divider"></div>

          <div className="mobile-menu-actions">
            <button type="button" className="mobile-action-item" onClick={() => handleNavigate('/settings')}>
              <SettingsIcon />
              <span>Paramètres</span>
            </button>
            <button type="button" className="mobile-action-item logout" onClick={handleLogout}>
              <LogoutIcon />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
