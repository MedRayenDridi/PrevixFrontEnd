import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminAppBar.css';

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.62l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.09-.47 0-.59.22L2.74 8.87c-.12.21-.08.48.12.62l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.62l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.48-.12-.62l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
);

export const AdminAppBar = ({ sidebarExpanded, user, onLogout }) => {
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const userDisplayName = user?.full_name || user?.email || 'User';
  const userRole = user?.user_roles?.[0]?.role?.role_identity || 'general_admin';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const getRoleLabel = () => {
    if (userRole === 'general_admin') return 'Administrateur';
    if (userRole === 'user_previx') return 'Collaborateur';
    return 'Client';
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const toggleUserMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUserMenuOpen(prev => !prev);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setUserMenuOpen(false);
  };

  return (
    <header className={`admin-appbar ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      <div className="admin-appbar-glow"></div>
      
      <div className="admin-appbar-content">
        <h1 className="admin-app-title">
            <img src="/Prev-EX africa Logo.jpeg" alt="Prev-IX Logo" className="admin-app-logo" />
            <span className="admin-app-title-glow"></span>
           </h1>

        <div className="admin-user-menu" ref={userMenuRef}>
          <button 
            type="button"
            className="admin-user-button"
            onClick={toggleUserMenu}
          >
            <span className="admin-user-avatar">
              {userDisplayName.charAt(0).toUpperCase()}
              <span className="admin-user-avatar-glow"></span>
            </span>
            <span className="admin-user-info">
              <span className="admin-user-name">{userDisplayName}</span>
              <span className="admin-user-role">{getRoleLabel()}</span>
            </span>
          </button>

          {userMenuOpen && (
            <div className="admin-user-dropdown open">
              <button
                type="button"
                className="admin-user-dropdown-item"
                onClick={() => handleNavigate('/profile')}
              >
                <PersonIcon />
                <span>Mon Profil</span>
              </button>
              <button
                type="button"
                className="admin-user-dropdown-item"
                onClick={() => handleNavigate('/settings')}
              >
                <SettingsIcon />
                <span>Paramètres</span>
              </button>
              <div className="admin-user-dropdown-divider"></div>
              <button
                type="button"
                className="admin-user-dropdown-item logout"
                onClick={handleLogout}
              >
                <LogoutIcon />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
