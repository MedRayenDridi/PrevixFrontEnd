import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import ProjectsMatrixAnimation from '../animation/ProjectsMatrixAnimation';
import ClientProjectList from './Clients/ClientProjectList';
import './ProjectList.css';

// Icons
const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z" />
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
  </svg>
);

const ViewIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
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
  const [viewMode, setViewMode] = useState('cards'); // Default to cards
  const [selectedProjects, setSelectedProjects] = useState([]);

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
    if (statusFilter) filtered = filtered.filter(project => project.status === statusFilter);
    if (typeFilter) filtered = filtered.filter(project => project.type_project === typeFilter);
    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter, typeFilter]);

  const handleView = (projectId) => navigate(`/projects/${projectId}`);
  const handleEdit = (projectId) => navigate(`/projects/${projectId}/edit`);
  const handleDelete = async (projectId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await deleteProject(projectId);
      } catch (err) {
        console.error(err);
      }
    }
  };
  const handleCreate = () => navigate('/projects/new');

  const canEdit = (project) => isAdmin() || project.created_by === user?.user_id;
  const canDelete = (project) => isAdmin() || project.created_by === user?.user_id;

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('fr-FR') : '-';
  const formatProgress = (progress) => `${progress || 0}%`;

  const handleSelectProject = (projectId) => {
    setSelectedProjects(prev =>
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedProjects.length === 0) return;
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedProjects.length} projet(s) ?`)) {
      try {
        await Promise.all(selectedProjects.map(id => deleteProject(id)));
        setSelectedProjects([]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
  };

  const getStatusLabel = (status) => {
    const labels = { active: 'Actif', archived: 'Archivé', completed: 'Terminé' };
    return labels[status] || status;
  };

  const getTypeLabel = (type) => {
    const labels = { IFRS: 'IFRS', Assurance: 'Assurance', Risk_Survey: 'Enquête de Risque', Other: 'Autre' };
    return labels[type] || type;
  };

  const activeFiltersCount = [searchTerm, statusFilter, typeFilter].filter(Boolean).length;

  const renderProjectCard = (project) => (
    <div key={project.project_id} className="project-card-admin">
      <div className="project-card-header-admin">
        <div className="project-header-left-admin">
          <div className="project-card-checkbox-admin">
            <input
              type="checkbox"
              checked={selectedProjects.includes(project.project_id)}
              onChange={() => handleSelectProject(project.project_id)}
            />
          </div>
          <FolderIcon />
          <div className="project-info-admin">
            <h3 className="project-title-admin">{project.name}</h3>
            <p className="project-date-admin">Créé le {formatDate(project.created_at)}</p>
          </div>
        </div>
        <div className="project-header-actions">
          <button
            className="btn-view-admin"
            onClick={() => handleView(project.project_id)}
            title="Voir le projet"
          >
            <ViewIcon />
          </button>
        </div>
      </div>

      <div className="project-card-body-admin">
        <p className="project-description-admin">
          {project.description || 'Aucune description'}
        </p>

        <div className="project-stats-admin">
          <div className="stat-item-admin">
            <span className="stat-label-admin">Type</span>
            <span className="stat-value-admin type-badge-admin">{getTypeLabel(project.type_project)}</span>
          </div>
          <div className="stat-item-admin">
            <span className="stat-label-admin">Statut</span>
            <span className={`stat-value-admin status-badge-admin status-${project.status}`}>
              {getStatusLabel(project.status)}
            </span>
          </div>
          <div className="stat-item-admin">
            <span className="stat-label-admin">Échéance</span>
            <span className="stat-value-admin">{formatDate(project.due_date)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-section-admin">
          <div className="progress-header-admin">
            <span className="progress-label-admin">Progression</span>
            <span className="progress-percent-admin">{project.progress || 0}%</span>
          </div>
          <div className="progress-bar-admin">
            <div 
              className="progress-fill-admin" 
              style={{ width: `${project.progress || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="project-card-footer-admin">
        {canEdit(project) && (
          <button
            className="btn-action-admin btn-edit-admin"
            onClick={() => handleEdit(project.project_id)}
            title="Modifier"
          >
            <EditIcon />
            <span>Modifier</span>
          </button>
        )}
        {canDelete(project) && (
          <button
            className="btn-action-admin btn-delete-admin"
            onClick={() => handleDelete(project.project_id)}
            title="Supprimer"
          >
            <DeleteIcon />
            <span>Supprimer</span>
          </button>
        )}
      </div>
    </div>
  );

  if (!isAdmin()) return <ClientProjectList />;
  if (loading) return <ProjectsMatrixAnimation isLoading={true} onComplete={() => {}} />;
  if (error) {
    return (
      <div className="project-list-container">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>Erreur: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="project-list-container">
      {/* Header */}
      <div className="project-list-header">
        <div className="header-left">
          <h1>Projets</h1>
          <span className="project-count">{filteredProjects.length} projet{filteredProjects.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="header-right">
          {selectedProjects.length > 0 && (
            <button className="btn-danger" onClick={handleBulkDelete}>
              <DeleteIcon />
              Supprimer ({selectedProjects.length})
            </button>
          )}
          <button className="btn-primary" onClick={handleCreate}>
            <PlusIcon />
            Nouveau Projet
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-container">
          <SearchIcon />
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <FilterIcon />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              {PROJECT_STATUSES.map(status => (
                <option key={status} value={status}>{getStatusLabel(status)}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Tous les types</option>
              {PROJECT_TYPES.map(type => (
                <option key={type} value={type}>{getTypeLabel(type)}</option>
              ))}
            </select>
          </div>

          {activeFiltersCount > 0 && (
            <button className="btn-clear-filters" onClick={clearFilters}>
              <CloseIcon />
              Réinitialiser ({activeFiltersCount})
            </button>
          )}

          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Vue Cartes"
            >
              <GridIcon />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Vue Tableau"
            >
              <ListIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'cards' ? (
        <div className="projects-grid-admin">
          {filteredProjects.map(renderProjectCard)}
          {filteredProjects.length === 0 && (
            <div className="no-projects">
              <div className="no-projects-icon">📂</div>
              <p>Aucun projet trouvé</p>
              <span className="no-projects-hint">Essayez de modifier vos filtres ou créez un nouveau projet</span>
            </div>
          )}
        </div>
      ) : (
        <div className="project-table-container">
          <table className="project-table">
            <thead>
              <tr>
                <th className="th-checkbox">
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
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => (
                <tr
                  key={project.project_id}
                  className={selectedProjects.includes(project.project_id) ? 'selected' : ''}
                >
                  <td className="td-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.project_id)}
                      onChange={() => handleSelectProject(project.project_id)}
                    />
                  </td>
                  <td>
                    <div className="project-name">
                      <strong>{project.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="type-badge-small">{getTypeLabel(project.type_project)}</span>
                  </td>
                  <td className="td-description">{project.description || '-'}</td>
                  <td>
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${project.progress ?? 0}%` }}></div>
                      </div>
                      <span className="progress-text">{formatProgress(project.progress)}</span>
                    </div>
                  </td>
                  <td>{formatDate(project.due_date)}</td>
                  <td>
                    <span className={`status-badge status-${project.status}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </td>
                  <td className="td-actions">
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-view"
                        onClick={() => handleView(project.project_id)}
                        title="Voir"
                      >
                        <ViewIcon />
                      </button>
                      {canEdit(project) && (
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(project.project_id)}
                          title="Modifier"
                        >
                          <EditIcon />
                        </button>
                      )}
                      {canDelete(project) && (
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(project.project_id)}
                          title="Supprimer"
                        >
                          <DeleteIcon />
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
              <div className="no-projects-icon">📂</div>
              <p>Aucun projet trouvé</p>
              <span className="no-projects-hint">Essayez de modifier vos filtres ou créez un nouveau projet</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
