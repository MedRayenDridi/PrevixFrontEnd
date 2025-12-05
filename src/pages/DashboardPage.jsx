import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import DashboardStats from '../components/dashboard/DashboardStats';
import DashboardGraphs from '../components/dashboard/DashboardGraphs';
import DashboardTasks from '../components/dashboard/DashboardTasks';
import DashboardCalendar from '../components/dashboard/DashboardCalendar';
import DashboardLoadingAnimation from '../components/animation/DashboardLoadingAnimation';
import MarketTicker from '../components/dashboard/MarketTicker'; // ✅ NEW IMPORT
import ClientDashboard from './Client/ClientDashboard';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, isAdmin, isStaff } = useAuth();
  const { projects, loading, error } = useProject();

  if (loading) {
    return <DashboardLoadingAnimation isLoading={true} onComplete={() => {}} />;
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <h2>Erreur lors du chargement du tableau de bord</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!isAdmin() && !isStaff()) {
    return <ClientDashboard />;
  }

  const renderAdminDashboard = () => (
    <div className="admin-dashboard">
      {/* Modern Header with Gradient */}
      <div className="dashboard-modern-header">
        <div className="header-glass-card">
          <div className="header-content-wrapper">
            <div className="header-text-section">
              <div className="greeting-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" className="sparkles-icon">
                  <path d="M12 1L9 9l-8 3 8 3 3 8 3-8 8-3-8-3-3-8z"/>
                </svg>
                <span>Tableau de Bord Administrateur</span>
              </div>
              <h1 className="modern-welcome-title">
                Bonjour, <span className="username-highlight">{user?.full_name || 'Administrateur'}</span>
              </h1>
              <p className="modern-welcome-subtitle">
                Vue d'ensemble sur projets et les performances
              </p>
            </div>
          </div>
        </div>
      </div>

      <MarketTicker />

      <div className="dashboard-main-content">
        <DashboardCalendar projects={projects} />
        <DashboardTasks projects={projects} />
      </div>

      <DashboardStats projects={projects} />
      <DashboardGraphs projects={projects} userRole="admin" />
    </div>
  );

  const renderStaffDashboard = () => (
    <div className="staff-dashboard">
      {/* ✅ ADD TICKER HERE TOO */}
      <MarketTicker />

      <div className="dashboard-header">
        <h1 className="dashboard-title">Tableau de Bord Collaborateur</h1>
        <p className="dashboard-subtitle">
          Vue d'ensemble de vos projets assignés et de leur progression
        </p>
      </div>

      <div className="user-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3 className="stat-number">{projects.length}</h3>
              <p className="stat-label">Vos Projets</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h3 className="stat-number">
                {projects.filter(p => p.status === 'active').length}
              </h3>
              <p className="stat-label">Projets Actifs</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3 className="stat-number">
                {projects.filter(p => p.status === 'completed').length}
              </h3>
              <p className="stat-label">Projets Terminés</p>
            </div>
          </div>
        </div>
      </div>

      <DashboardCalendar projects={projects} />
      <DashboardGraphs projects={projects} userRole="staff" />
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-floating-shapes">
        <div className="dashboard-floating-shape dashboard-shape-1"></div>
        <div className="dashboard-floating-shape dashboard-shape-2"></div>
        <div className="dashboard-floating-shape dashboard-shape-3"></div>
      </div>
      <div className="dashboard-grid-overlay"></div>

      <div className="dashboard-content-wrapper">
        {isAdmin() ? renderAdminDashboard() : renderStaffDashboard()}
      </div>
    </div>
  );
};

export default DashboardPage;
