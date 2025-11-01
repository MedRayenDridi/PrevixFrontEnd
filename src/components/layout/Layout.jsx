import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import './Layout.css'; // Import the CSS file

// ... (Icon components remain the same) ...
const MenuIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
    </svg>
);

const DashboardIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
);

const PersonIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
);

const GroupIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
);

const FolderIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
    </svg>
);

const LogoutIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
    </svg>
);

// We don't need Visibility icons for the left sidebar toggle
const VisibilityIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
);

const VisibilityOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
    </svg>
);


export const Layout = ({ children }) => {
    // Renaming state for clarity: sidebarOpen handles the state for both mobile and desktop
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const mainContentRef = useRef(null);

    const [sidebarOpen, setSidebarOpen] = useState(true); // Always start open

    // Add fade-in animation on route change
    useEffect(() => {
        if (mainContentRef.current) {
            gsap.fromTo(mainContentRef.current, {
                opacity: 0,
                y: 20
            }, {
                opacity: 1,
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    }, [location.pathname]);

    const menuItems = [
        { text: 'Tableau de Bord', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Projets', icon: <FolderIcon />, path: '/projects' },
        { text: 'Profil', icon: <PersonIcon />, path: '/profile' },
        ...(user.role === 'admin'
            ? [{ text: 'Admin', icon: <GroupIcon />, path: '/admin' }]
            : []),
    ];

    // This single function now toggles the sidebar's visibility
    const handleDrawerToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleNavigate = (path) => {
        navigate(path);
        // Only close the sidebar on navigation if it's open (mostly relevant for mobile)
        setSidebarOpen(false);
    };

    return (
        <div className="layout-container">
            {/* Background Elements */}
            <div className="layout-floating-shapes">
                <div className="layout-floating-shape layout-shape-1"></div>
                <div className="layout-floating-shape layout-shape-2"></div>
                <div className="layout-floating-shape layout-shape-3"></div>
            </div>
            <div className="layout-grid-overlay"></div>

            {/* AppBar - FIXED: Use sidebarOpen to adjust position */}
            <header className={`layout-appbar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="layout-appbar-content">
                    <button
                        className="layout-menu-button"
                        onClick={handleDrawerToggle}
                        aria-label="Toggle sidebar"
                    >
                        <MenuIcon />
                    </button>
                    <h1 className="layout-app-title">Outil d'Évaluation d'Actifs</h1>
                </div>
            </header>

            {/* Mobile Drawer Overlay - FIXED: Use sidebarOpen */}
            <div
                className={`layout-drawer-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={handleDrawerToggle}
            ></div>

            {/* Drawer / Sidebar - FIXED: Use sidebarOpen for 'open' class */}
            <nav className={`layout-drawer ${sidebarOpen ? 'open' : ''}`}>
                <div className="layout-drawer-header">
                    <div className="layout-drawer-logo">PrevIx</div>
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
                    <li
                        className="layout-menu-item logout"
                        onClick={handleLogout}
                    >
                        <span className="layout-menu-icon">
                            <LogoutIcon />
                        </span>
                        <span className="layout-menu-text">Déconnexion</span>
                    </li>
                </ul>
            </nav>

            {/* Main Content - FIXED: Use sidebarOpen to adjust margin-left */}
            <main ref={mainContentRef} className={`layout-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                {children}
            </main>
        </div>
    );
};