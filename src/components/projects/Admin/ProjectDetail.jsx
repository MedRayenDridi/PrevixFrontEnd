import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../../context/ProjectContext';
import { useAuth } from '../../../context/AuthContext';
import { projectService } from '../../../services/projectService';
import { adminService, clientProjectService, userService } from '../../../services/api';
import organizationService from '../../../services/organizationService';
import { useToast } from '../../common/Toast';
import AssetDisplay from '../../assets/AssetDisplay';
import ClassificationLoading from '../../animation/ClassificationLoading';
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

// ✅ Expand/Collapse Icons
const ExpandMoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
  </svg>
);

const ExpandLessIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
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
  const [reportGenerating, setReportGenerating] = useState(false);
  
  // ✅ State for organization and users data
  const [organizationData, setOrganizationData] = useState(null);
  const [creatorData, setCreatorData] = useState(null);
  const [orgClients, setOrgClients] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // ✅ State for expanding clients list
  const [showAllClients, setShowAllClients] = useState(false);
  
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

  // ✅ UPDATED: Enhanced debugging and multiple fallbacks
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!currentProject) return;
      
      setLoadingDetails(true);
      try {
        let allUsers = [];
        
        // ✅ Fetch all users
        try {
          const usersData = await userService.getAllUsers();
          allUsers = Array.isArray(usersData) ? usersData : [];
          console.log('✅ All users fetched:', allUsers.length);
        } catch (err) {
          console.error('⚠️ Failed to fetch users, trying alternative method:', err);
          try {
            const adminUsers = await adminService.getUsers();
            allUsers = Array.isArray(adminUsers) ? adminUsers : [];
            console.log('✅ Admin users fetched:', allUsers.length);
          } catch (adminErr) {
            console.error('❌ Failed to fetch users from admin service:', adminErr);
          }
        }

        // ✅ ENHANCED: Fetch organization with multiple fallbacks
        if (currentProject.org_id) {
          console.log('🔍 Fetching organization for org_id:', currentProject.org_id);
          try {
            const orgResponse = await organizationService.getOrganizationById(currentProject.org_id);
            console.log('🔍 Full Organization Response:', orgResponse);
            console.log('🔍 Response.success:', orgResponse?.success);
            console.log('🔍 Response.data:', orgResponse?.data);
            
            // ✅ Multiple fallback strategies
            let orgData = null;
            
            if (orgResponse && orgResponse.success && orgResponse.data) {
              console.log('✅ Strategy 1: Using orgResponse.data');
              orgData = orgResponse.data;
            } else if (orgResponse && orgResponse.data && !orgResponse.success) {
              console.log('✅ Strategy 2: Using orgResponse.data (no success field)');
              orgData = orgResponse.data;
            } else if (orgResponse && orgResponse.name) {
              console.log('✅ Strategy 3: Response is the data itself');
              orgData = orgResponse;
            } else if (orgResponse && typeof orgResponse === 'object') {
              console.log('✅ Strategy 4: Treating response as raw data');
              orgData = orgResponse;
            }
            
            if (orgData) {
              console.log('✅ Organization data set:', orgData);
              console.log('✅ Organization name:', orgData.name || orgData.org_name || orgData.organization_name);
              setOrganizationData(orgData);
            } else {
              console.warn('❌ Could not extract organization data from response');
            }
          } catch (err) {
            console.error('❌ Failed to fetch organization:', err);
            console.error('❌ Error response:', err.response?.data);
          }
          
          // ✅ Get organization members/clients
          try {
            const membersResponse = await organizationService.getOrganizationUsers(currentProject.org_id);
            console.log('🔍 Organization Members Response:', membersResponse);
            
            let members = [];
            
            if (membersResponse && membersResponse.success && membersResponse.data) {
              members = Array.isArray(membersResponse.data) ? membersResponse.data : [];
            } else if (membersResponse && membersResponse.data) {
              members = Array.isArray(membersResponse.data) ? membersResponse.data : [];
            } else if (Array.isArray(membersResponse)) {
              members = membersResponse;
            }
            
            console.log('🔍 Extracted members:', members);
            
            if (members.length > 0) {
              // Map to full user objects
              const clientUsers = members.map(member => {
                // If member already has user details
                if (member.user_id && (member.email || member.full_name)) {
                  return member;
                }
                // If member only has user_id, find in allUsers
                if (member.user_id) {
                  return allUsers.find(u => u.user_id === member.user_id);
                }
                // If member has a user object nested
                if (member.user) {
                  return member.user;
                }
                return null;
              }).filter(u => u !== null && u !== undefined);
              
              setOrgClients(clientUsers);
              console.log('✅ Organization clients set:', clientUsers.length, clientUsers);
            } else {
              console.log('⚠️ No members found for organization');
            }
          } catch (err) {
            console.error('❌ Failed to fetch organization members:', err);
          }
        } else {
          console.warn('⚠️ No org_id in project. Current project:', currentProject);
        }

        // ✅ Find creator (person who created the project)
        if (currentProject.created_by && allUsers.length > 0) {
          const creator = allUsers.find(u => u.user_id === currentProject.created_by);
          if (creator) {
            setCreatorData(creator);
            console.log('✅ Creator found:', creator);
          } else {
            console.warn(`⚠️ Creator with ID ${currentProject.created_by} not found in users list`);
          }
        }

        // ✅ Find assigned users
        if (currentProject.assigned_to && Array.isArray(currentProject.assigned_to) && allUsers.length > 0) {
          const users = currentProject.assigned_to
            .map(userId => allUsers.find(u => u.user_id === userId))
            .filter(u => u !== null && u !== undefined);
          setAssignedUsers(users);
          console.log('✅ Assigned users set:', users.length, users);
        }
      } catch (err) {
        console.error('❌ Failed to fetch project details:', err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchProjectDetails();
  }, [currentProject]);

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
  }, [id, activeTab, isAdmin]);

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
        toast.error('Erreur lors de la suppression du projet');
      }
    }
  };

  const handleUpload = () => {
    navigate(`/projects/${id}/upload`);
  };

  const handleDownloadReport = async (format) => {
    setReportGenerating(true);
    try {
      toast.info(`Génération du rapport ${format.toUpperCase()} en cours...`);
      
      const blob = await projectService.getProjectReport(id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
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
    if (!user) return false;
    if (isAdmin && isAdmin()) return true;
    if (currentProject?.assigned_to?.includes(user.user_id)) return true;
    return false;
  };

  const canDelete = () => {
    return isAdmin && isAdmin();
  };

  const canUpload = () => {
    if (!user) return false;
    if (isAdmin && isAdmin()) return true;
    if (currentProject?.assigned_to?.includes(user.user_id)) return true;
    if (currentProject?.created_by === user.user_id) return true;
    return false;
  };

  const handleRunClassification = async (fileId) => {
    setClassifyingFileId(fileId);
    setClassificationError(null);
    setClassificationSuccess(null);

    try {
      const result = await adminService.runClassification(id, fileId, true);
      
      // Don't close the loading screen here - let ClassificationLoading component handle it
      // The component will poll for status and show results/errors
      if (result.status === 'processing') {
        // Classification started in background, loading screen will poll for status
        toast.info('Classification démarrée. Suivi en cours...');
      } else if (result.status === 'ok') {
        // This shouldn't happen as classification runs in background, but handle it anyway
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
        // Error occurred, but keep loading screen open so user can see details
        setClassificationError('Une erreur est survenue pendant la classification.');
        toast.error('Erreur pendant la classification');
        // Don't close - let user see the error in the loading screen
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 
                      err.message || 
                      'Une erreur est survenue pendant la classification.';
      setClassificationError(errorMsg);
      toast.error(errorMsg);
      // Don't close - let user see the error in the loading screen
      // The ClassificationLoading component will handle displaying the error
    }
    // Removed finally block - let ClassificationLoading component manage when to close
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

  // ✅ Calculate how many clients to show initially
  const MAX_VISIBLE_CLIENTS = 3;
  const visibleClients = showAllClients ? orgClients : orgClients.slice(0, MAX_VISIBLE_CLIENTS);
  const hasMoreClients = orgClients.length > MAX_VISIBLE_CLIENTS;

  // ✅ Helper function to get organization name with fallbacks
  const getOrgName = () => {
    if (!organizationData) return null;
    return organizationData.name || 
           organizationData.org_name || 
           organizationData.organization_name || 
           organizationData.company_name || 
           null;
  };

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

              {/* ✅ UPDATED: Organization Display with Debug */}
              <div className="info-card">
                <h3>Organisation</h3>
                {loadingDetails ? (
                  <p className="loading-text">Chargement...</p>
                ) : getOrgName() ? (
                  <div className="organization-info">
                    <p className="org-name">{getOrgName()}</p>
                    {organizationData.org_type && (
                      <span className="org-type-badge">{organizationData.org_type}</span>
                    )}
                  </div>
                ) : organizationData ? (
                  <div className="organization-info">
                    <p className="org-name">Organisation sans nom</p>
                    {/* ✅ Debug section */}
                    <details style={{ marginTop: '10px', fontSize: '0.75rem', color: '#666' }}>
                      <summary style={{ cursor: 'pointer' }}>🔍 Debug: Voir les données</summary>
                      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', overflow: 'auto', maxHeight: '200px', fontSize: '0.7rem' }}>
                        {JSON.stringify(organizationData, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : currentProject.org_id ? (
                  <>
                    <p>Organisation ID: {currentProject.org_id}</p>
                    <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '5px' }}>⚠️ Données non chargées - Vérifiez la console (F12)</p>
                  </>
                ) : (
                  <p>Non définie</p>
                )}
              </div>

              {/* ✅ Creator Display */}
              <div className="info-card">
                <h3>Créé par</h3>
                {loadingDetails ? (
                  <p className="loading-text">Chargement...</p>
                ) : creatorData ? (
                  <div className="client-info">
                    <p className="client-name">{creatorData.full_name}</p>
                    <p className="client-email">{creatorData.email}</p>
                  </div>
                ) : currentProject.created_by ? (
                  <p>Utilisateur ID: {currentProject.created_by}</p>
                ) : (
                  <p>Non défini</p>
                )}
              </div>

              {/* ✅ Organization Clients Display with Expand/Collapse */}
              <div className="info-card">
                <div className="info-card-header-with-count">
                  <h3>Clients de l'organisation</h3>
                  {orgClients.length > 0 && (
                    <span className="clients-count-badge">{orgClients.length}</span>
                  )}
                </div>
                {loadingDetails ? (
                  <p className="loading-text">Chargement...</p>
                ) : orgClients.length > 0 ? (
                  <>
                    <div className="assigned-users">
                      {visibleClients.map((client, index) => (
                        <div key={client.user_id || index} className="user-tag">
                          <span className="user-name">{client.full_name || client.name}</span>
                          <span className="user-email">{client.email}</span>
                        </div>
                      ))}
                    </div>
                    {hasMoreClients && (
                      <button 
                        className="btn-show-more"
                        onClick={() => setShowAllClients(!showAllClients)}
                      >
                        {showAllClients ? (
                          <>
                            <ExpandLessIcon />
                            <span>Voir moins</span>
                          </>
                        ) : (
                          <>
                            <ExpandMoreIcon />
                            <span>Voir tous ({orgClients.length - MAX_VISIBLE_CLIENTS} de plus)</span>
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <p>Aucun client dans cette organisation</p>
                )}
              </div>

              {/* ✅ Assigned Staff/Collaborators Display */}
              {assignedUsers.length > 0 && (
                <div className="info-card">
                  <h3>Personnel assigné</h3>
                  <div className="assigned-users">
                    {assignedUsers.map((assignedUser, index) => (
                      <div key={assignedUser.user_id || index} className="user-tag">
                        <span className="user-name">{assignedUser.full_name}</span>
                        <span className="user-email">{assignedUser.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="info-card">
                <h3>Créé le</h3>
                <p>{formatDate(currentProject.created_at)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="tab-panel">
            <AssetDisplay projectId={id} isAdminUser={isAdmin && isAdmin()} />
          </div>
        )}

        {activeTab === 'files' && (
          <div className="files-tab tab-panel">
            <div className="files-header">
              <h3>Fichiers du projet</h3>
              {projectFiles.length > 0 && (
                <span className="files-count">{projectFiles.length} fichier{projectFiles.length > 1 ? 's' : ''}</span>
              )}
            </div>
            
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
                            className="btn-classify"
                            onClick={() => handleRunClassification(file.file_id)}
                            disabled={
                              classifyingFileId === file.file_id ||
                              file.processing_status === 'processing' ||
                              file.processing_status === 'completed'
                            }
                          >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>
                              {classifyingFileId === file.file_id
                                ? 'Classification...'
                                : 'Classifier'}
                            </span>
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
                <div className="report-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
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
                <div className="report-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V4C20 3.46957 19.7893 2.96086 19.4142 2.58579C19.0391 2.21071 18.5304 2 18 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 6H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 14H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h4>Rapport Excel</h4>
                <p>Exportez les données du projet et des actifs au format Excel pour une analyse approfondie.</p>
                <button
                  className="btn-primary"
                  onClick={() => handleDownloadReport('xlsx')}
                  disabled={reportGenerating}
                >
                  {reportGenerating ? (
                    <>
                      <span className="spinner-small"></span>
                      Génération...
                    </>
                  ) : (
                    'Télécharger Excel'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Classification Loading Screen */}
      <ClassificationLoading 
        isVisible={classifyingFileId !== null} 
        onClose={() => {
          setClassifyingFileId(null);
          // Refresh files list after classification
          loadProjectFiles();
        }}
        projectId={id}
        fileId={classifyingFileId}
      />
    </div>
  );
};

export default ProjectDetail;
