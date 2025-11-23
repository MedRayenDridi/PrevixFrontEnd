import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../../context/ProjectContext';
import { useAuth } from '../../../context/AuthContext';
import { projectService } from '../../../services/projectService';
import { clientProjectService } from '../../../services/api';
import ProjectsMatrixAnimation from '../../animation/ProjectsMatrixAnimation';
import './ClientProjectList.css';

// Icons
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
  </svg>
);

const ViewIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const ClientProjectList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, loading, error, fetchProjects } = useProject();
  const [clientProjects, setClientProjects] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [expandedProject, setExpandedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter projects for current user only
  useEffect(() => {
    if (projects && user) {
      const userProjects = projects.filter(p => p.created_by === user.user_id);
      setClientProjects(userProjects);
    }
  }, [projects, user]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    await handleFilesUpload(files);
  }, [user]);

  const handleFileInput = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    await handleFilesUpload(files);
  };

  const handleFilesUpload = async (files) => {
    try {
      setUploading(true);

      // Create project name from first file or timestamp
      const projectName = `Projet ${new Date().toLocaleDateString('fr-FR')} - ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

      // Use the new client upload endpoint that creates project and uploads files in one call
      console.log(`Creating project and uploading ${files.length} files...`);

      const result = await clientProjectService.uploadFilesAndCreateProject(
        files,
        projectName,
        'IFRS'
      );

      console.log('Upload result:', result);

      // Refresh projects list
      await fetchProjects();

      // Navigate to the new project
      if (result.project_id) {
        navigate(`/projects/${result.project_id}`);
      }

      alert(`✅ Projet créé avec succès! ${result.files.length} fichier(s) téléchargé(s).`);
    } catch (err) {
      console.error('Error uploading files:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Erreur lors du téléchargement';
      alert(`❌ Erreur: ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const toggleProjectExpand = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['xlsx', 'xls', 'csv'].includes(ext)) return '📊';
    if (['pdf'].includes(ext)) return '📄';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
    if (['doc', 'docx'].includes(ext)) return '📝';
    return '📎';
  };

  if (loading && clientProjects.length === 0) {
    return <ProjectsMatrixAnimation isLoading={true} onComplete={() => {}} />;
  }

  return (
    <div className="client-project-list">
      {/* Upload Zone */}
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-zone-content">
          <UploadIcon />
          <h2>Glissez vos fichiers ici</h2>
          <p>ou cliquez pour sélectionner des fichiers</p>
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="file-input"
            id="file-upload"
            disabled={uploading}
          />
          <label htmlFor="file-upload" className="upload-button">
            Sélectionner des fichiers
          </label>
          {uploading && (
            <div className="upload-progress">
              <div className="spinner"></div>
              <p>Téléchargement en cours...</p>
            </div>
          )}
        </div>
      </div>

      {/* Projects List */}
      <div className="client-projects-section">
        <h2 className="section-title">
          <FolderIcon />
          Mes Projets ({clientProjects.length})
        </h2>

        {error && (
          <div className="error-message">
            Erreur: {error}
          </div>
        )}

        {clientProjects.length === 0 ? (
          <div className="no-projects">
            <p>Vous n'avez pas encore de projet.</p>
            <p>Glissez des fichiers ci-dessus pour créer votre premier projet.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {clientProjects.map((project) => (
              <div key={project.project_id} className="project-card-client">
                <div className="project-card-header-client">
                  <div className="project-header-left">
                    <FolderIcon />
                    <div className="project-info">
                      <h3 className="project-title-client">{project.name}</h3>
                      <p className="project-date">Créé le {formatDate(project.created_at)}</p>
                    </div>
                  </div>
                  <button
                    className="btn-view-client"
                    onClick={() => handleViewProject(project.project_id)}
                    title="Voir le projet"
                  >
                    <ViewIcon />
                  </button>
                </div>

                <div className="project-card-body-client">
                  <p className="project-description-client">
                    {project.description || 'Aucune description'}
                  </p>

                  <div className="project-stats">
                    <div className="stat-item">
                      <span className="stat-label">Type</span>
                      <span className="stat-value">{project.type_project}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Statut</span>
                      <span className={`status-badge-client status-${project.status}`}>
                        {project.status === 'active' ? 'Actif' : project.status === 'completed' ? 'Terminé' : 'Archivé'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Échéance</span>
                      <span className="stat-value">{formatDate(project.due_date)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress-section">
                    <div className="progress-header">
                      <span className="progress-label">Progression</span>
                      <span className="progress-percent">{project.progress || 0}%</span>
                    </div>
                    <div className="progress-bar-client">
                      <div 
                        className="progress-fill-client" 
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Files Section - Expandable */}
                <div className="project-files-section">
                  <button
                    className="files-toggle"
                    onClick={() => toggleProjectExpand(project.project_id)}
                  >
                    <FileIcon />
                    <span>Fichiers du projet</span>
                    <span className={`arrow ${expandedProject === project.project_id ? 'expanded' : ''}`}>▼</span>
                  </button>

                  {expandedProject === project.project_id && (
                    <div className="files-list">
                      <p className="files-placeholder">
                        Chargement des fichiers...
                      </p>
                      {/* You can add actual file fetching logic here */}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProjectList;
