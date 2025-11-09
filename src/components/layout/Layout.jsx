import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../../context/AuthContext';
import { AdminAppBar } from './AdminAppBar';
import { AdminSidebar } from './AdminSidebar';
import { ClientTopNav } from './ClientTopNav';
import './Layout.css';

export const Layout = ({ children }) => {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const mainContentRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false); // Start collapsed - hover will expand

  const userIsAdmin = isAdmin();

  // Fade-in animation on route change
  useEffect(() => {
    if (mainContentRef.current) {
      gsap.fromTo(
        mainContentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [location.pathname]);

  // Handle sidebar expansion changes from the sidebar itself
  const handleSidebarExpandChange = (expanded) => {
    setSidebarExpanded(expanded);
  };

  // ADMIN LAYOUT
  if (userIsAdmin) {
    return (
      <div className="layout-container layout-admin">
        <div className="layout-floating-shapes">
          <div className="layout-floating-shape layout-shape-1"></div>
          <div className="layout-floating-shape layout-shape-2"></div>
          <div className="layout-floating-shape layout-shape-3"></div>
        </div>
        <div className="layout-grid-overlay"></div>

        <AdminAppBar 
          sidebarExpanded={sidebarExpanded}
          user={user}
          onLogout={logout}
        />

        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          onLogout={logout}
          sidebarExpanded={sidebarExpanded}
          onExpandChange={handleSidebarExpandChange}
        />

        <main 
          ref={mainContentRef} 
          className={`layout-main ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
        >
          {children}
        </main>
      </div>
    );
  }

  // CLIENT LAYOUT
  return (
    <div className="layout-container layout-client">
      <div className="layout-floating-shapes">
        <div className="layout-floating-shape layout-shape-1"></div>
        <div className="layout-floating-shape layout-shape-2"></div>
        <div className="layout-floating-shape layout-shape-3"></div>
      </div>
      <div className="layout-grid-overlay"></div>

      <ClientTopNav 
        user={user}
        onLogout={logout}
      />

      <main ref={mainContentRef} className="layout-main-client">
        {children}
      </main>
    </div>
  );
};
