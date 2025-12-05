import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminSidebar.css';


// Icons
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


const OrganizationIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
  </svg>
);


// ✅ NEW: Parameters Icon
const ParametersIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
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


const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.45-1.32C5.77 20.78 6.47 20 7 20c.72 0 1.5.67 2 2 1.39-.56 3.09-1.5 4-2.5 1.65-1.86 2.5-4.5 2.5-7.5 0-2.5-.5-5-2.5-6z"/>
  </svg>
);


export const AdminSidebar = ({ isOpen, onClose, user, onLogout, sidebarExpanded, onExpandChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);


  // ✅ UPDATED: Added Parameters menu item
  const menuItems = [
    { text: 'Tableau de Bord', icon: <DashboardIcon />, path: '/dashboard', id: 'home' },
    { text: 'Projets', icon: <FolderIcon />, path: '/projects', id: 'projects' },
    { text: 'Organisations', icon: <OrganizationIcon />, path: '/organizations', id: 'organizations' },
    { text: 'Gestion des utilisateurs', icon: <GroupIcon />, path: '/admin', id: 'users' },
    { text: 'Paramètres système', icon: <ParametersIcon />, path: '/parameters', id: 'parameters' },
    { text: 'Profil', icon: <PersonIcon />, path: '/profile', id: 'profile' },
    { text: 'Paramètres', icon: <SettingsIcon />, path: '/settings', id: 'settings' },
  ];


  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      onClose();
    }
  };


  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };


  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onExpandChange && !isPinned) {
      onExpandChange(true);
    }
  };


  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onExpandChange && !isPinned) {
      onExpandChange(false);
    }
  };


  const handleClick = () => {
    setIsPinned(!isPinned);
    if (onExpandChange) {
      onExpandChange(!isPinned);
    }
  };


  const isExpanded = isPinned || isHovered || sidebarExpanded;
  const userDisplayName = user?.full_name || user?.email || 'User';


  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`admin-sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      />


      {/* Sidebar */}
      <nav 
        className={`admin-sidebar-modern ${isOpen ? 'mobile-open' : ''} ${isExpanded ? 'expanded' : 'collapsed'} ${isPinned ? 'pinned' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        
        {/* Logo Section */}
        <div className="sidebar-logo-section">
          <div className="sidebar-logo-icon">
            <LeafIcon />
          </div>
          <span className={`sidebar-title ${isExpanded ? 'visible' : 'hidden'}`}>
            Prev-IX
          </span>
        </div>


        {/* Navigation Menu */}
        <ul className="sidebar-menu-modern">
          {menuItems.map((item) => (
            <li 
              key={item.id}
              className={`sidebar-item-modern ${location.pathname === item.path ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate(item.path);
              }}
              title={!isExpanded ? item.text : ''}
            >
              <div className="item-icon-modern">{item.icon}</div>
              <span className={`item-text-modern ${isExpanded ? 'visible' : 'hidden'}`}>
                {item.text}
              </span>
            </li>
          ))}
        </ul>


        {/* User Section at Bottom */}
        <div className="sidebar-footer-modern">
          <div className="footer-user-modern">
            <div className="user-avatar-modern">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className={`user-info-modern ${isExpanded ? 'visible' : 'hidden'}`}>
              <div className="user-name-modern">{userDisplayName}</div>
              <div className="user-email-modern">{user?.email}</div>
            </div>
          </div>
          
          <button 
            className="logout-btn-modern"
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            title="Déconnexion"
          >
            <LogoutIcon />
          </button>
        </div>


        {/* Pin Indicator */}
        {isPinned && (
          <div className="sidebar-pin-indicator">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" />
            </svg>
          </div>
        )}
      </nav>
    </>
  );
};
