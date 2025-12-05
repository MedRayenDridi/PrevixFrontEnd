import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // ✅ ADD THIS
import { Clock, BarChart3, Calendar, Users, Eye } from 'lucide-react';

const DashboardTasks = ({ projects }) => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();  // ✅ ADD THIS

  useEffect(() => {
    // Generate tasks from projects data
    const generatedTasks = [];

    projects.forEach(project => {
      // Overdue tasks
      if (new Date(project.due_date) < new Date() && project.status !== 'completed') {
        const pid = project.project_id ?? project.id ?? project._id ?? Math.random().toString(36).slice(2,8);
        generatedTasks.push({
          id: `overdue-${pid}`,
          type: 'overdue',
          title: `Le projet "${project.name}" est en retard`,
          description: `Date d'échéance: ${new Date(project.due_date).toLocaleDateString('fr-FR')}`,
          priority: 'high',
          projectId: pid,
          projectName: project.name
        });
      }

      // Low progress tasks
      if (project.progress < 25 && project.status === 'active') {
        const pid = project.project_id ?? project.id ?? project._id ?? Math.random().toString(36).slice(2,8);
        generatedTasks.push({
          id: `low-progress-${pid}`,
          type: 'progress',
          title: `Faible progression sur "${project.name}"`,
          description: `Progression actuelle: ${project.progress}%`,
          priority: 'medium',
          projectId: pid,
          projectName: project.name
        });
      }

      // Upcoming deadlines (within 7 days)
      const daysUntilDue = Math.ceil((new Date(project.due_date) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue > 0 && daysUntilDue <= 7 && project.status === 'active') {
        const pid = project.project_id ?? project.id ?? project._id ?? Math.random().toString(36).slice(2,8);
        generatedTasks.push({
          id: `deadline-${pid}`,
          type: 'deadline',
          title: `Échéance proche pour "${project.name}"`,
          description: `Échéance dans ${daysUntilDue} jour${daysUntilDue > 1 ? 's' : ''}`,
          priority: 'medium',
          projectId: pid,
          projectName: project.name
        });
      }

      // Unassigned projects
      if (!project.assigned_to || project.assigned_to.length === 0) {
        const pid = project.project_id ?? project.id ?? project._id ?? Math.random().toString(36).slice(2,8);
        generatedTasks.push({
          id: `unassigned-${pid}`,
          type: 'assignment',
          title: `Le projet "${project.name}" nécessite une assignation`,
          description: 'Aucun collaborateur assigné à ce projet',
          priority: 'high',
          projectId: pid,
          projectName: project.name
        });
      }
    });

    // Sort tasks by priority (high -> medium -> low)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    generatedTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    setTasks(generatedTasks.slice(0, 10)); // Show top 10 tasks
  }, [projects]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'task-priority-high';
      case 'medium': return 'task-priority-medium';
      case 'low': return 'task-priority-low';
      default: return 'task-priority-low';
    }
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'overdue': return <Clock size={20} />;
      case 'progress': return <BarChart3 size={20} />;
      case 'deadline': return <Calendar size={20} />;
      case 'assignment': return <Users size={20} />;
      default: return <BarChart3 size={20} />;
    }
  };

  // ✅ ADD THIS FUNCTION
  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="dashboard-tasks">
      <div className="tasks-header">
        <h2 className="tasks-title">Tâches Importantes</h2>
        <p className="tasks-subtitle">Prochaines échéances</p>
      </div>

      <div className="tasks-content">
        {tasks.length === 0 ? (
          <div className="tasks-empty">
            <div className="empty-icon">✅</div>
            <h3 className="empty-title">Tout est à jour !</h3>
            <p className="empty-description">Aucune tâche urgente pour le moment</p>
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map(task => (
              <div key={task.id} className={`task-item ${getPriorityColor(task.priority)}`}>
                <div className="task-icon">
                  {getTaskIcon(task.type)}
                </div>
                <div className="task-content">
                  <h4 className="task-title">{task.title}</h4>
                  <p className="task-description">{task.description}</p>
                  <div className="task-meta">
                    <span className="task-project">{task.projectName}</span>
                    <span className={`task-priority-badge ${task.priority}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="task-actions">
                  {/* ✅ ADD onClick HANDLER */}
                  <button 
                    className="task-action-btn"
                    onClick={() => handleViewProject(task.projectId)}
                  >
                    <Eye size={16} />
                    Voir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTasks;
