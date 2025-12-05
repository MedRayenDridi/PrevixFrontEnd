import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../../context/ProjectContext';
import { useAuth } from '../../../context/AuthContext';
import { projectService } from '../../../services/projectService';
import { adminService, clientProjectService } from '../../../services/api';
import { useToast } from '../../common/Toast';
import AssetDisplay from '../../assets/AssetDisplay';
import './ProjectDetail.css';


// ✅ Icons
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

// ✅ Loading Skeleton Component
const ProjectDetailSkeleton = () => (
  <div className="project-detail-container">
    <div className="project-detail-header">
      <div className="project-title-section">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-meta"></div>
      </div>
      <div className="project-actions">
        <div className="skeleton skeleton-button"></div>
        <div className="skeleton skeleton-button"></div>
      </div>
    </div>
    <div className="project-tabs">
      <div className="skeleton skeleton-tab"></div>
      <div className="skeleton skeleton-tab"></div>
      <div className="skeleton skeleton-tab"></div>
      <div className="skeleton skeleton-tab"></div>
    </div>
    <div className="tab-content">
      <div className="skeleton-content">
        <div className="skeleton skeleton-card"></div>
        <div className="skeleton skeleton-card"></div>
        <div className="skeleton skeleton-card"></div>
      </div>
    </div>
  </div>
);

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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [reportGenerating, setReportGenerating] = useState(false); // ✅ NEW: Report loading state
  const toast = useToast();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const project = await projectService.getProject(id);
        setCurrentProject(project);
        setIsInitialLoad(false);
      } catch (err) {
        console.error('Failed to fetch project:', err);
        setIsInitialLoad(false);
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
        const raw = (isAdmin && isAdmin())
          ? await adminService.getProjectFiles(id)
          : await clientProjectService.getProjectFiles(id);

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

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  const handleEdit = () => {
    navigate(`/projects/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
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

  // ✅ UPDATED: Enhanced report download handler
  const handleDownloadReport = async (format) => {
    setReportGenerating(true);
    try {
      toast.info(`Génération du rapport ${format.toUpperCase()} en cours...`);
      
      const blob = await projectService.getProjectReport(id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Better filename with project name and date
      const timestamp = new Date().toISOString().split('T')[0];
      const projectName = currentProject.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `rapport_${projectName}_${timestamp}.${format}`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Rapport ${format.toUpperCase()} téléchargé avec succès !`);
    } catch (err) {
      console.error('Failed to download report:', err);
      
      if (err.message === 'Excel reports are not yet available') {
        toast.warning('Les rapports Excel ne sont pas encore disponibles. Utilisez le format PDF.');
      } else {
        toast.error(`Erreur lors de la génération du rapport: ${err.response?.data?.detail || err.message}`);
      }
    } finally {
      setReportGenerating(false);
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
      'error': 'Erreur',
      'active': 'Actif',
      'archived': 'Archivé'
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

  if (isInitialLoad || loading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !currentProject) {
    return (
      <div className="project-detail-container">
        <div className="error-message-container">
          <div className="error-icon">⚠️</div>
          <h2>Projet non trouvé</h2>
          <p>{error || 'Le projet demandé n\'existe pas ou vous n\'avez pas accès.'}</p>
          <button className="btn-primary" onClick={handleBackToProjects}>
            <BackIcon />
            Retour aux projets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-container">
      <button className="btn-back" onClick={handleBackToProjects}>
        <BackIcon />
        <span>Retour aux projets</span>
      </button>

      <div className="project-detail-header">
        <div className="project-title-section">
          <h1>{currentProject.name}</h1>
          <div className="project-meta">
            <span className={`status-badge status-${currentProject.status}`}>
              {getStatusLabel(currentProject.status)}
            </span>
            <span className="project-type">{currentProject.type_project}</span>
          </div>
        </div>
        <div className="project-actions">
          {canEdit() && (
            <button className="btn-secondary" onClick={handleEdit}>
              <EditIcon />
              Modifier
            </button>
          )}
          {canUpload() && (
            <button className="btn-primary" onClick={handleUpload}>
              <UploadIcon />
              Uploader
            </button>
          )}
          {canDelete() && (
            <button className="btn-danger" onClick={handleDelete}>
              <DeleteIcon />
              Supprimer
            </button>
          )}
        </div>
      </div>

      <div className="project-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </button>
        <button
          className={`tab-button ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          Actifs
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
          Rapports
        </button>
      </div>

      <div className="tab-content" key={activeTab}>
        {activeTab === 'overview' && (
          <div className="overview-tab tab-panel">
            <div className="project-info-grid">
              <div className="info-card">
                <h3>Description</h3>
                <p>{currentProject.description || 'Aucune description'}</p>
              </div>

              <div className="info-card">
                <h3>Progrès</h3>
                <div className="progress-display">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${currentProject.progress || 0}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{currentProject.progress || 0}% Complété</span>
                </div>
              </div>

              <div className="info-card">
                <h3>Date d'échéance</h3>
                <p>{formatDate(currentProject.due_date)}</p>
              </div>

              <div className="info-card">
                <h3>Client</h3>
                <p>{getUserName(currentProject.client)}</p>
              </div>

              <div className="info-card">
                <h3>Assigné à</h3>
                <div className="assigned-users">
                  {currentProject.assigned_to?.length > 0 ? (
                    currentProject.assigned_to.map(userId => (
                      <span key={userId} className="user-tag">
                        {getUserName(userId)}
                      </span>
                    ))
                  ) : (
                    <p>Aucun utilisateur assigné</p>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h3>Créé le</h3>
                <p>{formatDate(currentProject.created_at)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="tab-panel">
            <AssetDisplay projectId={id} />
          </div>
        )}

        {activeTab === 'files' && (
          <div className="files-tab tab-panel">
            <h3>Fichiers du projet</h3>
            
            {classificationError && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                {classificationError}
              </div>
            )}
            
            {classificationSuccess && (
              <div className="alert alert-success">
                <span className="alert-icon">✓</span>
                {classificationSuccess}
              </div>
            )}

            {filesLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Chargement des fichiers...</p>
              </div>
            ) : projectFiles.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <p>Aucun fichier uploadé pour ce projet</p>
                <button className="btn-primary" onClick={handleUpload}>
                  <UploadIcon />
                  Uploader des fichiers
                </button>
              </div>
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
                              ? 'Classification...'
                              : 'Classifier'}
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
          <div className="reports-tab tab-panel">
            <h3>Générer des rapports</h3>
            
            {/* ✅ NEW: Report Summary Card */}
            <div className="report-summary-card">
              <h4>Aperçu du rapport</h4>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Projet:</span>
                  <span className="stat-value">{currentProject.name}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Type:</span>
                  <span className="stat-value">{currentProject.type_project}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Statut:</span>
                  <span className="stat-value">{getStatusLabel(currentProject.status)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Progrès:</span>
                  <span className="stat-value">{currentProject.progress || 0}%</span>
                </div>
              </div>
            </div>

            <div className="report-options">
              <div className="report-card">
                <div className="report-icon">📄</div>
                <h4>Rapport PDF</h4>
                <p>Générez un rapport PDF complet avec tous les détails du projet et des actifs.</p>
                <button
                  className="btn-primary"
                  onClick={() => handleDownloadReport('pdf')}
                  disabled={reportGenerating}
                >
                  {reportGenerating ? (
                    <>
                      <span className="spinner-small"></span>
                      Génération...
                    </>
                  ) : (
                    'Télécharger PDF'
                  )}
                </button>
              </div>
              
              <div className="report-card">
                <div className="report-icon">📊</div>
                <h4>Rapport Excel</h4>
                <p>Exportez les données du projet et des actifs au format Excel pour une analyse approfondie.</p>
                <button
                  className="btn-primary btn-disabled"
                  onClick={() => handleDownloadReport('xlsx')}
                  disabled={true}
                >
                  Télécharger Excel
                </button>
                <span className="badge-coming-soon">Bientôt disponible</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
