import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import ProjectsMatrixAnimation from '../animation/ProjectsMatrixAnimation';
import ClientProjectList from './Clients/ClientProjectList';
import './ProjectList.css';

// Icons
const ViewIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-4 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/>
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

const PROJECT_STATUSES = ['active', 'archived', 'completed'];
const PROJECT_TYPES = ['IFRS', 'Assurance', 'Risk_Survey', 'Other'];

const ProjectList = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { projects, loading, error, fetchProjects, deleteProject } = useProject();
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [selectedProjects, setSelectedProjects] = useState([]);

  // Redirect non-admins to ClientProjectList
  if (!isAdmin()) {
    return <ClientProjectList />;
  }

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(project => project.type_project === typeFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter, typeFilter]);

  const handleView = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleEdit = (projectId) => {
    navigate(`/projects/${projectId}/edit`);
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await deleteProject(projectId);
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  const handleCreate = () => {
    navigate('/projects/new');
  };

  const canEdit = (project) => {
    return isAdmin() || project.created_by === user?.user_id;
  };

  const canDelete = (project) => {
    return isAdmin() || project.created_by === user?.user_id;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatProgress = (progress) => {
    return `${progress || 0}%`;
  };

  const handleSelectProject = (projectId) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedProjects.length === 0) return;
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedProjects.length} projet(s) ?`)) {
      try {
        await Promise.all(selectedProjects.map(id => deleteProject(id)));
        setSelectedProjects([]);
      } catch (err) {
        console.error('Failed to delete projects:', err);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
  };

  const getStatusLabel = (status) => {
    const labels = {
      'active': 'Actif',
      'archived': 'Archivé',
      'completed': 'Complété',
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'IFRS': 'IFRS',
      'Assurance': 'Assurance',
      'Risk_Survey': 'Enquête de Risque',
      'Other': 'Autre',
    };
    return labels[type] || type;
  };

  const renderProjectCard = (project) => (
    <div key={project.project_id} className="project-card">
      <div className="project-card-header">
        <div className="project-card-checkbox">
          <input
            type="checkbox"
            checked={selectedProjects.includes(project.project_id)}
            onChange={() => handleSelectProject(project.project_id)}
          />
        </div>
        <div className="project-card-status">
          <span className={`status-badge status-${project.status}`}>
            {getStatusLabel(project.status)}
          </span>
        </div>
      </div>

      <div className="project-card-content">
        <h3 className="project-card-title">{project.name}</h3>
        <p className="project-card-description">{project.description || 'Pas de description'}</p>

        <div className="project-card-meta">
          <div className="project-card-meta-item">
            <span className="meta-label">Type:</span>
            <span className="meta-value">{getTypeLabel(project.type_project)}</span>
          </div>
          <div className="project-card-meta-item">
            <span className="meta-label">Progrès:</span>
            <span className="meta-value">{formatProgress(project.progress)}</span>
          </div>
          <div className="project-card-meta-item">
            <span className="meta-label">Créé:</span>
            <span className="meta-value">{formatDate(project.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="project-card-actions">
        <button
          className="btn-icon btn-view"
          onClick={() => handleView(project.project_id)}
          title="Voir le projet"
        >
          <ViewIcon />
        </button>
        {canEdit(project) && (
          <button
            className="btn-icon btn-edit"
            onClick={() => handleEdit(project.project_id)}
            title="Modifier le projet"
          >
            <EditIcon />
          </button>
        )}
        {canDelete(project) && (
          <button
            className="btn-icon btn-delete"
            onClick={() => handleDelete(project.project_id)}
            title="Supprimer le projet"
          >
            <DeleteIcon />
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <ProjectsMatrixAnimation isLoading={true} onComplete={() => {}} />;
  }

  if (error) {
    return (
      <div className="project-list-container">
        <div className="error-message">Erreur: {error}</div>
      </div>
    );
  }

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <div className="header-left">
          <h1>Projets</h1>
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Vue Tableau"
            >
              <ListIcon />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Vue Cartes"
            >
              <GridIcon />
            </button>
          </div>
        </div>
        <div className="header-right">
          {selectedProjects.length > 0 && (
            <button className="btn-danger" onClick={handleBulkDelete}>
              Supprimer la Sélection ({selectedProjects.length})
            </button>
          )}
          <button className="btn-primary" onClick={handleCreate}>
            <PlusIcon />
            Nouveau Projet
          </button>
        </div>
      </div>

      <div className="project-filters">
        <div className="filter-group search-group">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Rechercher des projets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-group">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Tous les Types</option>
            {PROJECT_TYPES.map(type => (
              <option key={type} value={type}>
                {getTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Tous les Statuts</option>
            {PROJECT_STATUSES.map(status => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          {(searchTerm || statusFilter || typeFilter) && (
            <button className="btn-link" onClick={clearFilters}>
              Tout Effacer
            </button>
          )}
        </div>
      </div>

      {(searchTerm || statusFilter || typeFilter) && (
        <div className="active-filters">
          <span className="filters-label">Filtres actifs:</span>
          {searchTerm && (
            <span className="filter-tag">
              Recherche: "{searchTerm}"
              <button onClick={() => setSearchTerm('')}>×</button>
            </span>
          )}
          {typeFilter && (
            <span className="filter-tag">
              Type: {getTypeLabel(typeFilter)}
              <button onClick={() => setTypeFilter('')}>×</button>
            </span>
          )}
          {statusFilter && (
            <span className="filter-tag">
              Statut: {getStatusLabel(statusFilter)}
              <button onClick={() => setStatusFilter('')}>×</button>
            </span>
          )}
        </div>
      )}

      {viewMode === 'table' ? (
        <div className="project-table-container">
          <table className="project-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                    onChange={() => {
                      if (selectedProjects.length === filteredProjects.length) {
                        setSelectedProjects([]);
                      } else {
                        setSelectedProjects(filteredProjects.map(p => p.project_id));
                      }
                    }}
                  />
                </th>
                <th>Nom</th>
                <th>Type</th>
                <th>Description</th>
                <th>Progrès</th>
                <th>Échéance</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => (
                <tr key={project.project_id} className={selectedProjects.includes(project.project_id) ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.project_id)}
                      onChange={() => handleSelectProject(project.project_id)}
                    />
                  </td>
                  <td>
                    <div className="project-name-cell">
                      <strong>{project.name}</strong>
                    </div>
                  </td>
                  <td>{getTypeLabel(project.type_project)}</td>
                  <td>{project.description || '-'}</td>
                  <td>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${project.progress || 0}%` }}></div>
                      <span className="progress-text">{formatProgress(project.progress)}</span>
                    </div>
                  </td>
                  <td>{formatDate(project.due_date)}</td>
                  <td>
                    <span className={`status-badge status-${project.status}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-secondary btn-small"
                        onClick={() => handleView(project.project_id)}
                      >
                        Voir
                      </button>
                      {canEdit(project) && (
                        <button
                          className="btn-secondary btn-small"
                          onClick={() => handleEdit(project.project_id)}
                        >
                          Modifier
                        </button>
                      )}
                      {canDelete(project) && (
                        <button
                          className="btn-danger btn-small"
                          onClick={() => handleDelete(project.project_id)}
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProjects.length === 0 && (
            <div className="no-projects">
              <p>Aucun projet trouvé correspondant à vos critères.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="project-cards-container">
          {filteredProjects.map(renderProjectCard)}

          {filteredProjects.length === 0 && (
            <div className="no-projects">
              <p>Aucun projet trouvé correspondant à vos critères.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
