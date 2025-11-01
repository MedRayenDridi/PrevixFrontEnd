import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Activity, Calendar, TrendingUp } from 'lucide-react';

const DashboardGraphs = ({ projects, userRole }) => {
  // Prepare data for charts
  const progressData = projects.map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
    progress: project.progress,
    status: project.status
  }));

  // Timeline data - group by month
  const timelineData = projects.reduce((acc, project) => {
    const month = new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ month, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.month) - new Date(b.month));

  // Status distribution for current projects
  const statusData = [
    { name: 'Active', count: projects.filter(p => p.status === 'active').length },
    { name: 'Completed', count: projects.filter(p => p.status === 'completed').length },
    { name: 'On Hold', count: projects.filter(p => p.status === 'on-hold').length },
    { name: 'Cancelled', count: projects.filter(p => p.status === 'cancelled').length }
  ];

  // Average progress over time (mock data for demonstration)
  const progressTrendData = [
    { month: 'Jan', avgProgress: 25 },
    { month: 'Feb', avgProgress: 35 },
    { month: 'Mar', avgProgress: 45 },
    { month: 'Apr', avgProgress: 55 },
    { month: 'May', avgProgress: 65 },
    { month: 'Jun', avgProgress: 75 }
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label, formatter, labelFormatter }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">
            {labelFormatter ? labelFormatter(label) : label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color || '#1c91af' }}>
              {formatter ? formatter(entry.value, entry.name) : `${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-graphs">
      <div className="graphs-header">
        <h2 className="graphs-title">
          {userRole === 'admin' ? 'Aperçu des Analyses de Projet' : 'Vos Insights de Projet'}
        </h2>
        <p className="graphs-subtitle">
          {userRole === 'admin'
            ? 'Analyse complète de tous les projets et métriques de performance'
            : 'Aperçu visuel de vos projets assignés et de la progression'
          }
        </p>
      </div>

      <div className="graphs-grid">
        {/* Progress Overview */}
        <div className="graph-card">
          <div className="graph-header">
            <Activity size={20} />
            <h3 className="graph-title">Aperçu de la Progression des Projets</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1c91af" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1c91af" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(7, 49, 92, 0.1)" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#07315c"
                fontSize={12}
                tick={{ fill: '#07315c' }}
              />
              <YAxis
                stroke="#07315c"
                fontSize={12}
                tick={{ fill: '#07315c' }}
              />
              <Tooltip content={<CustomTooltip formatter={(value) => [`${value}%`, 'Progression']} labelFormatter={(label) => `Projet: ${label}`} />} />
              <Bar dataKey="progress" fill="url(#progressGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Project Timeline */}
        <div className="graph-card">
          <div className="graph-header">
            <Calendar size={20} />
            <h3 className="graph-title">Chronologie de Création des Projets</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1c91af" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="#1c91af" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#1c91af" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(7, 49, 92, 0.1)" />
              <XAxis
                dataKey="month"
                stroke="#07315c"
                fontSize={12}
                tick={{ fill: '#07315c' }}
              />
              <YAxis
                stroke="#07315c"
                fontSize={12}
                tick={{ fill: '#07315c' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#1c91af"
                fill="url(#timelineGradient)"
                strokeWidth={3}
                dot={{ fill: '#1c91af', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#1c91af', strokeWidth: 2, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="graph-card">
          <div className="graph-header">
            <TrendingUp size={20} />
            <h3 className="graph-title">Répartition des Statuts de Projet</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="statusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1c91af" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1c91af" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(7, 49, 92, 0.1)" />
              <XAxis
                dataKey="name"
                stroke="#07315c"
                fontSize={12}
                tick={{ fill: '#07315c' }}
              />
              <YAxis
                stroke="#07315c"
                fontSize={12}
                tick={{ fill: '#07315c' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="url(#statusGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Trend (Admin only) */}
        {userRole === 'admin' && (
          <div className="graph-card">
            <div className="graph-header">
              <TrendingUp size={20} />
              <h3 className="graph-title">Tendance de Progression dans le Temps</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(7, 49, 92, 0.1)" />
                <XAxis
                  dataKey="month"
                  stroke="#07315c"
                  fontSize={12}
                  tick={{ fill: '#07315c' }}
                />
                <YAxis
                  stroke="#07315c"
                  fontSize={12}
                  tick={{ fill: '#07315c' }}
                />
                <Tooltip content={<CustomTooltip formatter={(value) => [`${value}%`, 'Progression Moyenne']} />} />
                <Line
                  type="monotone"
                  dataKey="avgProgress"
                  stroke="#1c91af"
                  strokeWidth={4}
                  dot={{ fill: '#1c91af', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, stroke: '#1c91af', strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardGraphs;
