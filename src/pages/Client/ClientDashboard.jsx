import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import ExchangeRateTable from '../ExchangeRateTable';
import MarketTicker from '../../components/dashboard/MarketTicker';
import './ClientDashboard.css';

// Modern Icons
const TrendingUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
  </svg>
);

const ArrowForwardIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
  </svg>
);

const ExchangeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
  </svg>
);

const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L9 9l-8 3 8 3 3 8 3-8 8-3-8-3-3-8z"/>
  </svg>
);

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects } = useProject();
  
  const [clientProjects, setClientProjects] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0,
    avgProgress: 0,
  });

  useEffect(() => {
  if (projects && user) {
    // Show all projects for the user's org(s)
    const currentOrgIds = user.user_roles.map(ur => ur.org_id);
    const userProjects = projects.filter(p =>
      currentOrgIds.includes(p.org_id)
    );
    setClientProjects(userProjects);

    const active = userProjects.filter(p => p.status === 'active').length;
    const completed = userProjects.filter(p => p.status === 'completed').length;
    const avgProgress = userProjects.length > 0
      ? Math.round(userProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / userProjects.length)
      : 0;

    setStats({
      total: userProjects.length,
      active,
      completed,
      pending: userProjects.length - active - completed,
      avgProgress,
    });
  }
}, [projects, user]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRecentProjects = () => {
    return clientProjects
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  };

  const getUpcomingDeadlines = () => {
    return clientProjects
      .filter(p => p.due_date && new Date(p.due_date) > new Date())
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5);
  };

  return (
    <div className="modern-client-dashboard">
      {/* Modern Header with Gradient */}
      <div className="dashboard-modern-header">
        <div className="header-glass-card">
          <div className="header-content-wrapper">
            <div className="header-text-section">
              <div className="greeting-badge">
                <SparklesIcon />
                <span>Tableau de Bord</span>
              </div>
              <h1 className="modern-welcome-title">
                Bonjour, <span className="username-highlight">{user?.full_name || 'Client'}</span>
              </h1>
              <p className="modern-welcome-subtitle">
                Gérez vos projets et suivez leur progression en temps réel
              </p>
            </div>
            <button className="modern-cta-button" onClick={() => navigate('/projects')}>
              <span>Tous les projets</span>
              <ArrowForwardIcon />
            </button>
          </div>
        </div>
      </div>

      <MarketTicker />

      {/* Modern Stats Cards */}
      <div className="modern-stats-grid">
        <div className="modern-stat-card stat-card-1">
          <div className="stat-card-bg"></div>
          <div className="stat-icon-container">
            <FolderIcon />
          </div>
          <div className="stat-details">
            <p className="stat-label">Total Projets</p>
            <h3 className="stat-number">{stats.total}</h3>
            <div className="stat-trend">
              <span className="trend-positive">↑ Actif</span>
            </div>
          </div>
        </div>

        <div className="modern-stat-card stat-card-2">
          <div className="stat-card-bg"></div>
          <div className="stat-icon-container">
            <TrendingUpIcon />
          </div>
          <div className="stat-details">
            <p className="stat-label">En Cours</p>
            <h3 className="stat-number">{stats.active}</h3>
            <div className="stat-trend">
              <span className="trend-positive">↑ +{stats.active}</span>
            </div>
          </div>
        </div>

        <div className="modern-stat-card stat-card-3">
          <div className="stat-card-bg"></div>
          <div className="stat-icon-container">
            <CheckCircleIcon />
          </div>
          <div className="stat-details">
            <p className="stat-label">Terminés</p>
            <h3 className="stat-number">{stats.completed}</h3>
            <div className="stat-trend">
              <span className="trend-neutral">✓ Complétés</span>
            </div>
          </div>
        </div>

        <div className="modern-stat-card stat-card-4">
          <div className="stat-card-bg"></div>
          <div className="stat-icon-container">
            <SparklesIcon />
          </div>
          <div className="stat-details">
            <p className="stat-label">Progression Moy.</p>
            <h3 className="stat-number">{stats.avgProgress}%</h3>
            <div className="stat-trend">
              <span className="trend-positive">↑ Progression</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="modern-content-grid">
        {/* Recent Projects */}
        <div className="modern-glass-card projects-section">
          <div className="card-header-modern">
            <div className="header-title-group">
              <div className="header-icon-badge">
                <FolderIcon />
              </div>
              <div>
                <h2 className="card-title-modern">Projets Récents</h2>
                <p className="card-subtitle-modern">Vos derniers projets actifs</p>
              </div>
            </div>
            <button className="view-all-link" onClick={() => navigate('/projects')}>
              Voir tout
              <ArrowForwardIcon />
            </button>
          </div>

          <div className="projects-modern-list">
            {getRecentProjects().length === 0 ? (
              <div className="empty-state-modern">
                <FolderIcon />
                <p>Aucun projet pour le moment</p>
                <button className="modern-btn-secondary" onClick={() => navigate('/projects')}>
                  Créer un projet
                </button>
              </div>
            ) : (
              getRecentProjects().map(project => (
                <div 
                  key={project.project_id} 
                  className="project-card-glass"
                  onClick={() => navigate(`/projects/${project.project_id}`)}
                >
                  <div className="project-header-row">
                    <div className="project-main-info">
                      <h4 className="project-title-modern">{project.name}</h4>
                      <p className="project-meta-text">{formatDate(project.created_at)}</p>
                    </div>
                    <span className={`modern-status-badge status-${project.status}`}>
                      {project.status === 'active' ? 'Actif' : project.status === 'completed' ? 'Terminé' : 'Archivé'}
                    </span>
                  </div>

                  <div className="progress-section-modern">
                    <div className="progress-info-row">
                      <span className="progress-label-text">Progression</span>
                      <span className="progress-value-text">{project.progress || 0}%</span>
                    </div>
                    <div className="modern-progress-bar">
                      <div 
                        className="modern-progress-fill" 
                        style={{ width: `${project.progress || 0}%` }}
                      >
                        <div className="progress-glow"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Exchange Rate */}
        <div className="modern-glass-card exchange-section">
          <div className="card-header-modern">
            <div className="header-title-group">
              <div className="header-icon-badge">
                <ExchangeIcon />
              </div>
              <div>
                <h2 className="card-title-modern">Taux de Change</h2>
                <p className="card-subtitle-modern">Taux actuels en temps réel</p>
              </div>
            </div>
          </div>
          <div className="exchange-content-wrapper">
            <ExchangeRateTable baseCurrency="TND" />
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="modern-glass-card deadlines-section">
          <div className="card-header-modern">
            <div className="header-title-group">
              <div className="header-icon-badge">
                <CalendarIcon />
              </div>
              <div>
                <h2 className="card-title-modern">Échéances Prochaines</h2>
                <p className="card-subtitle-modern">Dates limites à venir</p>
              </div>
            </div>
          </div>

          <div className="deadlines-modern-list">
            {getUpcomingDeadlines().length === 0 ? (
              <div className="empty-state-compact-modern">
                <CalendarIcon />
                <p>Aucune échéance prochaine</p>
              </div>
            ) : (
              getUpcomingDeadlines().map(project => (
                <div 
                  key={project.project_id} 
                  className="deadline-item-modern"
                  onClick={() => navigate(`/projects/${project.project_id}`)}
                >
                  <div className="deadline-icon-badge">
                    <CalendarIcon />
                  </div>
                  <div className="deadline-content">
                    <h4 className="deadline-project-name">{project.name}</h4>
                    <p className="deadline-date-display">{formatDate(project.due_date)}</p>
                  </div>
                  <div className={`deadline-counter ${getDaysUntilDeadline(project.due_date) <= 7 ? 'urgent' : ''}`}>
                    {getDaysUntilDeadline(project.due_date)}j
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function
const getDaysUntilDeadline = (dateString) => {
  if (!dateString) return 0;
  const deadline = new Date(dateString);
  const today = new Date();
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export default ClientDashboard;
