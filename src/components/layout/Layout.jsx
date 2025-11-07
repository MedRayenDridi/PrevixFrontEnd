import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

// Icon components
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const GroupIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.62l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.09-.47 0-.59.22L2.74 8.87c-.12.21-.08.48.12.62l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.62l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.48-.12-.62l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);

export const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isStaff, isClient } = useAuth();
  const mainContentRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Add fade-in animation on route change
  useEffect(() => {
    if (mainContentRef.current) {
      gsap.fromTo(
        mainContentRef.current,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        }
      );
    }
  }, [location.pathname]);

  // Build menu items based on user roles
  // Build menu items based on user roles
const getMenuItems = () => {
  const baseItems = [
    { text: 'Tableau de Bord', icon: <DashboardIcon />, path: '/dashboard' },
  ];

  // Add Projects for everyone (admins, staff, and clients)
  baseItems.push({ text: 'Projets', icon: <FolderIcon />, path: '/projects' });

  // Add Users management for admin only
  if (isAdmin()) {
    baseItems.push({ text: 'Utilisateurs', icon: <GroupIcon />, path: '/admin' });
  }

  // Profile is available to everyone
  baseItems.push({ text: 'Profil', icon: <PersonIcon />, path: '/profile' });

  // Settings for admin only
  if (isAdmin()) {
    baseItems.push({ text: 'Paramètres', icon: <SettingsIcon />, path: '/settings' });
  }

  return baseItems;
};


  const menuItems = getMenuItems();

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Get user display name
  const userDisplayName = user?.full_name || user?.email || 'User';
  const userRole = user?.user_roles?.[0]?.role?.role_identity || 'client_previx';

  return (
    <div className="layout-container">
      {/* Background Elements */}
      <div className="layout-floating-shapes">
        <div className="layout-floating-shape layout-shape-1"></div>
        <div className="layout-floating-shape layout-shape-2"></div>
        <div className="layout-floating-shape layout-shape-3"></div>
      </div>
      <div className="layout-grid-overlay"></div>

      {/* AppBar */}
      <header className={`layout-appbar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="layout-appbar-content">
          <button
            className="layout-menu-button"
            onClick={handleDrawerToggle}
            aria-label="Toggle sidebar"
          >
            <MenuIcon />
          </button>
          <h1 className="layout-app-title">Prev-IX</h1>

          {/* User Menu */}
          <div className="layout-user-menu">
            <button
              className="layout-user-button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              title={userDisplayName}
            >
              <div className="layout-user-avatar">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
              <div className="layout-user-info">
                <div className="layout-user-name">{userDisplayName}</div>
                <div className="layout-user-role">
                  {userRole === 'general_admin' && 'Administrateur'}
                  {userRole === 'user_previx' && 'Collaborateur'}
                  {userRole === 'client_previx' && 'Client'}
                </div>
              </div>
            </button>

            {/* User Menu Dropdown */}
            <div className={`layout-user-dropdown ${userMenuOpen ? 'open' : ''}`}>
              <div 
                className="layout-user-dropdown-item" 
                onClick={() => {
                  navigate('/profile');
                  setUserMenuOpen(false);
                }}
              >
                <PersonIcon />
                <span>Mon Profil</span>
              </div>
              {isAdmin() && (
                <div 
                  className="layout-user-dropdown-item" 
                  onClick={() => {
                    navigate('/settings');
                    setUserMenuOpen(false);
                  }}
                >
                  <SettingsIcon />
                  <span>Paramètres</span>
                </div>
              )}
              <div className="layout-user-dropdown-divider"></div>
              <div
                className="layout-user-dropdown-item logout"
                onClick={() => {
                  handleLogout();
                  setUserMenuOpen(false);
                }}
              >
                <LogoutIcon />
                <span>Déconnexion</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`layout-drawer-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={handleDrawerToggle}
      ></div>

      {/* Drawer / Sidebar */}
      <nav className={`layout-drawer ${sidebarOpen ? 'open' : ''}`}>
        <div className="layout-drawer-header">
          <div className="layout-drawer-logo">Prev-IX</div>
          <div className="layout-drawer-version">v1.0</div>
        </div>

        <ul className="layout-menu-list">
          {menuItems.map((item) => (
            <li
              key={item.text}
              className={`layout-menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigate(item.path)}
            >
              <span className="layout-menu-icon">{item.icon}</span>
              <span className="layout-menu-text">{item.text}</span>
            </li>
          ))}
        </ul>

        {/* Sidebar Footer with User Info */}
        <div className="layout-drawer-footer">
          <div className="layout-drawer-user-info">
            <div className="layout-drawer-user-avatar">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="layout-drawer-user-details">
              <div className="layout-drawer-user-name">{userDisplayName}</div>
              <div className="layout-drawer-user-email">{user?.email}</div>
            </div>
          </div>
          <button
            className="layout-drawer-logout-button"
            onClick={handleLogout}
            title="Déconnexion"
          >
            <LogoutIcon />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main ref={mainContentRef} className={`layout-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {children}
      </main>
    </div>
  );
};
