import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../../context/ProjectContext';
import { useAuth } from '../../../context/AuthContext';
import { projectService } from '../../../services/projectService';
import { adminService, clientProjectService } from '../../../services/api';
import { useToast } from '../../common/Toast';
import AssetDisplay from '../../assets/AssetDisplay';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { currentProject, setCurrentProject, loading, error, deleteProject } = useProject();

  const [activeTab, setActiveTab] = useState('overview');
  const [projectFiles, setProjectFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [classifyingFileId, setClassifyingFileId] = useState(null);
  const [classificationError, setClassificationError] = useState(null);
  const [classificationSuccess, setClassificationSuccess] = useState(null);
  const toast = useToast();

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

  useEffect(() => {
    const fetchFiles = async () => {
      if (!id) return;
      setFilesLoading(true);
      try {
        // Admin endpoint is different than the client endpoint; choose based on user role
        const raw = (isAdmin && isAdmin())
          ? await adminService.getProjectFiles(id)
          : await clientProjectService.getProjectFiles(id);

        // Normalize response - the API may return the array directly or inside data
        const files = Array.isArray(raw)
          ? raw
          : (raw && Array.isArray(raw.data))
            ? raw.data
            : (raw && Array.isArray(raw.files))
              ? raw.files
              : [];

        setProjectFiles(files);
      } catch (err) {
        console.error('Failed to fetch project files:', err);
      } finally {
        setFilesLoading(false);
      }
    };

    if (id && activeTab === 'files') {
      fetchFiles();
    }
  }, [id, activeTab]);



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

  const getUserName = (userId) => {
    // In a real app, you'd have a users context or fetch user details
    return `User ${userId}`;
  };

  const handleRunClassification = async (fileId) => {
    setClassifyingFileId(fileId);
    setClassificationError(null);
    setClassificationSuccess(null);

    try {
      const result = await adminService.runClassification(id, fileId, true);
      
      if (result.status === 'ok') {
        const summary = result.mapping_summary;
        const importStats = result.import_stats;
        
        let message = `Classification terminée avec succès. `;
        if (importStats) {
          message += `${importStats.success} actifs importés sur ${importStats.total}.`;
        } else {
          message += `Type d'actif détecté: ${summary.detected_asset_type}.`;
        }
        
        setClassificationSuccess(message);
        toast.success(message);
        
        // Refresh files list
        const files = await adminService.getProjectFiles(id);
        setProjectFiles(files);
      } else {
        setClassificationError('Une erreur est survenue pendant la classification.');
        toast.error('Erreur pendant la classification');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 
                      err.message || 
                      'Une erreur est survenue pendant la classification.';
      setClassificationError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setClassifyingFileId(null);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'En attente',
      'processing': 'En cours',
      'completed': 'Classé',
      'error': 'Erreur'
    };
    return labels[status] || status;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Fichiers
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

        {activeTab === 'files' && (
          <div className="files-tab">
            <h3>Fichiers du projet</h3>
            
            {classificationError && (
              <div className="error-message" style={{ marginBottom: '1rem', padding: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
                {classificationError}
              </div>
            )}
            
            {classificationSuccess && (
              <div className="success-message" style={{ marginBottom: '1rem', padding: '1rem', background: '#d4edda', color: '#155724', borderRadius: '4px' }}>
                {classificationSuccess}
              </div>
            )}

            {filesLoading ? (
              <div className="loading-spinner">Chargement des fichiers...</div>
            ) : projectFiles.length === 0 ? (
              <p>Aucun fichier uploadé pour ce projet.</p>
            ) : (
              <table className="files-table">
                <thead>
                  <tr>
                    <th>Nom du fichier</th>
                    <th>Type</th>
                    <th>Taille</th>
                    <th>Uploadé par</th>
                    <th>Date d'upload</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projectFiles.map((file) => (
                    <tr key={file.file_id}>
                      <td>{file.original_filename}</td>
                      <td>{file.file_type}</td>
                      <td>{formatFileSize(file.file_size)}</td>
                      <td>{file.uploaded_by_name || `User ${file.uploaded_by}`}</td>
                      <td>{formatDate(file.uploaded_at)}</td>
                      <td>
                        <span className={`status-badge status-${file.processing_status}`}>
                          {getStatusLabel(file.processing_status)}
                        </span>
                      </td>
                      <td>
                        {/* Only admins can trigger classification */}
                        {isAdmin && isAdmin() && (
                          <button
                            className="btn-primary btn-sm"
                            onClick={() => handleRunClassification(file.file_id)}
                            disabled={
                              classifyingFileId === file.file_id ||
                              file.processing_status === 'processing' ||
                              file.processing_status === 'completed'
                            }
                          >
                            {classifyingFileId === file.file_id
                              ? 'Classification en cours...'
                              : 'Lancer la classification'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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
