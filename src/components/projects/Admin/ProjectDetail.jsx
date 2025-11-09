import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../../context/ProjectContext';
import { useAuth } from '../../../context/AuthContext';
import { projectService } from '../../../services/projectService';
import AssetDisplay from '../../assets/AssetDisplay';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentProject, setCurrentProject, loading, error, deleteProject } = useProject();

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const project = await projectService.getProject(id);
        setCurrentProject(project);
      } catch (err) {
        console.error('Failed to fetch project:', err);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id, setCurrentProject]);



  const handleEdit = () => {
    navigate(`/projects/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        navigate('/projects');
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  const handleUpload = () => {
    navigate(`/projects/${id}/upload`);
  };

  const handleDownloadReport = async (format) => {
    try {
      const blob = await projectService.getProjectReport(id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${id}-report.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download report:', err);
    }
  };

  const canEdit = () => {
    if (user.role === 'admin') return true;
    if (user.role === 'collaborator') return currentProject?.assigned_to?.includes(user.id);
    return false;
  };

  const canDelete = () => {
    return user.role === 'admin';
  };

  const canUpload = () => {
    if (user.role === 'admin') return true;
    if (user.role === 'collaborator') return currentProject?.assigned_to?.includes(user.id);
    if (user.role === 'client') return currentProject?.client === user.id;
    return false;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUserName = (userId) => {
    // In a real app, you'd have a users context or fetch user details
    return `User ${userId}`;
  };

  if (loading) {
    return (
      <div className="project-detail-container">
        <div className="loading-spinner">Loading project...</div>
      </div>
    );
  }

  if (error || !currentProject) {
    return (
      <div className="project-detail-container">
        <div className="error-message">
          {error || 'Project not found'}
        </div>
        <button className="btn-secondary" onClick={() => navigate('/projects')}>
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="project-detail-container">
      <div className="project-detail-header">
        <div className="project-title-section">
          <h1>{currentProject.name}</h1>
          <div className="project-meta">
            <span className={`status-badge status-${currentProject.status}`}>
              {currentProject.status}
            </span>
            <span className="project-type">{currentProject.type}</span>
          </div>
        </div>
        <div className="project-actions">
          {canEdit() && (
            <button className="btn-secondary" onClick={handleEdit}>
              Edit
            </button>
          )}
          {canUpload() && (
            <button className="btn-primary" onClick={handleUpload}>
              Upload Files
            </button>
          )}
          {canDelete() && (
            <button className="btn-danger" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="project-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          Assets
        </button>
        <button
          className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="project-info-grid">
              <div className="info-card">
                <h3>Description</h3>
                <p>{currentProject.description}</p>
              </div>

              <div className="info-card">
                <h3>Progress</h3>
                <div className="progress-display">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${currentProject.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{currentProject.progress}% Complete</span>
                </div>
              </div>

              <div className="info-card">
                <h3>Due Date</h3>
                <p>{formatDate(currentProject.due_date)}</p>
              </div>

              <div className="info-card">
                <h3>Client</h3>
                <p>{getUserName(currentProject.client)}</p>
              </div>

              <div className="info-card">
                <h3>Assigned To</h3>
                <div className="assigned-users">
                  {currentProject.assigned_to?.length > 0 ? (
                    currentProject.assigned_to.map(userId => (
                      <span key={userId} className="user-tag">
                        {getUserName(userId)}
                      </span>
                    ))
                  ) : (
                    <p>No users assigned</p>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h3>Created</h3>
                <p>{formatDate(currentProject.created_at)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <AssetDisplay projectId={id} />
        )}

        {activeTab === 'reports' && (
          <div className="reports-tab">
            <h3>Generate Reports</h3>
            <div className="report-options">
              <div className="report-card">
                <h4>PDF Report</h4>
                <p>Generate a comprehensive PDF report with all project details and assets.</p>
                <button
                  className="btn-primary"
                  onClick={() => handleDownloadReport('pdf')}
                >
                  Download PDF
                </button>
              </div>
              <div className="report-card">
                <h4>Excel Report</h4>
                <p>Export project data and assets to Excel format for further analysis.</p>
                <button
                  className="btn-primary"
                  onClick={() => handleDownloadReport('xlsx')}
                >
                  Download Excel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
