import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import DashboardStats from '../components/dashboard/DashboardStats';
import DashboardGraphs from '../components/dashboard/DashboardGraphs';
import DashboardTasks from '../components/dashboard/DashboardTasks';
import DashboardCalendar from '../components/dashboard/DashboardCalendar';
import DashboardLoadingAnimation from '../components/animation/DashboardLoadingAnimation';
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

  // NON-ADMIN: Return ClientDashboard WITHOUT wrapper
  if (!isAdmin() && !isStaff()) {
    return <ClientDashboard />;
  }

  const renderAdminDashboard = () => (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Tableau de Bord Administrateur</h1>
        <p className="dashboard-subtitle">
          Vue d'ensemble sur projets et les performances</p>
      </div>
        
         {/* Calendar and Tasks Section */}
              <div className="dashboard-main-content">
              <DashboardCalendar projects={projects} />
              <DashboardTasks projects={projects} />
             </div>
         {/* Stats Section */}
              <DashboardStats projects={projects} />
           {/* Graphs Section */}
             <DashboardGraphs projects={projects} userRole="admin" />
    </div>
  );

  const renderStaffDashboard = () => (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Tableau de Bord Collaborateur</h1>
        <p className="dashboard-subtitle">
          Vue d'ensemble de vos projets assignés et de leur progression
        </p>
      </div>

      {/* Quick Stats for Staff */}
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

      {/* Calendar Section */}
      <DashboardCalendar projects={projects} />

      {/* Graphs Section */}
      <DashboardGraphs projects={projects} userRole="staff" />
    </div>
  );

  // ADMIN/STAFF: Return with wrapper
  return (
    <div className="dashboard-container">
      {/* Background Elements */}
      <div className="dashboard-floating-shapes">
        <div className="dashboard-floating-shape dashboard-shape-1"></div>
        <div className="dashboard-floating-shape dashboard-shape-2"></div>
        <div className="dashboard-floating-shape dashboard-shape-3"></div>
      </div>
      <div className="dashboard-grid-overlay"></div>

      {/* Main Content */}
      <div className="dashboard-content-wrapper">
        {isAdmin() ? renderAdminDashboard() : renderStaffDashboard()}
      </div>
    </div>
  );
};

export default DashboardPage;
