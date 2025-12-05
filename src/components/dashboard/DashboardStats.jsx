import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, CheckCircle, AlertTriangle, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

const DashboardStats = ({ projects }) => {
  // Calculate stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const overdueProjects = projects.filter(p => new Date(p.due_date) < new Date() && p.status !== 'completed').length;

  // Project type distribution
  const typeData = [
    { name: 'IFRS', value: projects.filter(p => p.type === 'IFRS').length },
    { name: 'Assurance', value: projects.filter(p => p.type === 'Assurance').length }
  ];

  // Status distribution
  const statusData = [
    { name: 'Active', value: activeProjects, color: '#1c91af' },
    { name: 'Completed', value: completedProjects, color: '#06A77D' },
    { name: 'On Hold', value: projects.filter(p => p.status === 'on-hold').length, color: '#D8A34B' },
    { name: 'Cancelled', value: projects.filter(p => p.status === 'cancelled').length, color: '#E55353' }
  ];

  // Progress distribution
  const progressData = [
    { name: '0-25%', count: projects.filter(p => p.progress >= 0 && p.progress < 25).length },
    { name: '25-50%', count: projects.filter(p => p.progress >= 25 && p.progress < 50).length },
    { name: '50-75%', count: projects.filter(p => p.progress >= 50 && p.progress < 75).length },
    { name: '75-100%', count: projects.filter(p => p.progress >= 75 && p.progress <= 100).length }
  ];

  return (
    <div className="dashboard-stats">
      {/* Key Metrics Cards */}
      <div className="modern-stats-grid">
        <div className="modern-stat-card stat-card-1">
          <div className="stat-card-bg"></div>
          <div className="stat-icon-container">
            <BarChart3 size={24} />
          </div>
          <div className="stat-details">
            <p className="stat-label">Total des Projets</p>
            <h3 className="stat-number">{totalProjects}</h3>
            <div className="stat-trend">
              <span className="trend-positive">↑ Actif</span>
            </div>
          </div>
        </div>

        <div className="modern-stat-card stat-card-2">
          <div className="stat-card-bg"></div>
          <div className="stat-icon-container">
            <TrendingUp size={24} />
          </div>
          <div className="stat-details">
            <p className="stat-label">Projets Actifs</p>
            <h3 className="stat-number">{activeProjects}</h3>
            <div className="stat-trend">
              <span className="trend-positive">↑ +{activeProjects}</span>
            </div>
          </div>
        </div>

        <div className="modern-stat-card stat-card-3">
          <div className="stat-card-bg"></div>
          <div className="stat-icon-container">
            <CheckCircle size={24} />
          </div>
          <div className="stat-details">
            <p className="stat-label">Projets Terminés</p>
            <h3 className="stat-number">{completedProjects}</h3>
            <div className="stat-trend">
              <span className="trend-neutral">✓ Complétés</span>
            </div>
          </div>
        </div>

        <div className="modern-stat-card stat-card-4">
          <div className="stat-card-bg"></div>
          <div className="stat-icon-container">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-details">
            <p className="stat-label">Projets en Retard</p>
            <h3 className="stat-number">{overdueProjects}</h3>
            <div className="stat-trend">
              <span className="trend-neutral">⚠ Retard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Project Types Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <PieChartIcon size={20} />
            <h3 className="chart-title">Répartition des Types de Projet</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#1c91af"
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#1c91af' : '#07315c'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(7, 49, 92, 0.1)',
                  borderRadius: '8px',
                  color: '#07315c',
                  boxShadow: '0 4px 12px rgba(7, 49, 92, 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution Bar Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <BarChart3 size={20} />
            <h3 className="chart-title">Aperçu du Statut des Projets</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(7, 49, 92, 0.1)" />
              <XAxis
                dataKey="name"
                stroke="#07315c"
                fontSize={12}
                tick={{ fill: '#07315c' }}
              />
              <YAxis stroke="#07315c" fontSize={12} tick={{ fill: '#07315c' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(7, 49, 92, 0.1)',
                  borderRadius: '8px',
                  color: '#07315c',
                  boxShadow: '0 4px 12px rgba(7, 49, 92, 0.1)',
                }}
              />
              <Bar dataKey="value" fill="#1c91af" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <TrendingUp size={20} />
            <h3 className="chart-title">Répartition de la Progression</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(7, 49, 92, 0.1)" />
              <XAxis
                dataKey="name"
                stroke="#07315c"
                fontSize={12}
                tick={{ fill: '#07315c' }}
              />
              <YAxis stroke="#07315c" fontSize={12} tick={{ fill: '#07315c' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(7, 49, 92, 0.1)',
                  borderRadius: '8px',
                  color: '#07315c',
                  boxShadow: '0 4px 12px rgba(7, 49, 92, 0.1)',
                }}
              />
              <Bar dataKey="count" fill="#1c91af" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
