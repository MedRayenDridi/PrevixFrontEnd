import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { PROJECT_STATUSES, PROJECT_TYPES } from '../../types/projectTypes';
import ProjectsMatrixAnimation from '../animation/ProjectsMatrixAnimation';
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

const ProjectList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, loading, error, fetchProjects, deleteProject } = useProject();
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [selectedProjects, setSelectedProjects] = useState([]);


  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(project => project.type === typeFilter);
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
    if (user.role === 'admin') return true;
    if (user.role === 'collaborator') return project.assigned_to.includes(user.id);
    return false;
  };

  const canDelete = () => {
    return user.role === 'admin';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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

  const renderProjectCard = (project) => (
    <div key={project.id} className="project-card">
      <div className="project-card-header">
        <div className="project-card-checkbox">
          <input
            type="checkbox"
            checked={selectedProjects.includes(project.id)}
            onChange={() => handleSelectProject(project.id)}
          />
        </div>
        <div className="project-card-status">
          <span className={`status-badge status-${project.status}`}>
            {project.status}
          </span>
        </div>
      </div>

      <div className="project-card-content">
        <h3 className="project-card-title">{project.name}</h3>
        <p className="project-card-description">{project.description}</p>

        <div className="project-card-meta">
          <div className="project-card-meta-item">
            <span className="meta-label">Type :</span>
            <span className="meta-value">{project.type}</span>
          </div>
          <div className="project-card-meta-item">
            <span className="meta-label">Échéance :</span>
            <span className="meta-value">{formatDate(project.due_date)}</span>
          </div>
        </div>

        <div className="project-card-progress">
          <div className="progress-info">
            <span className="progress-label">Progrès</span>
            <span className="progress-value">{project.progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="project-card-actions">
        <button
          className="btn-icon btn-view"
          onClick={() => handleView(project.id)}
          title="View Project"
        >
          <ViewIcon />
        </button>
        {canEdit(project) && (
          <button
            className="btn-icon btn-edit"
            onClick={() => handleEdit(project.id)}
            title="Edit Project"
          >
            <EditIcon />
          </button>
        )}
        {canDelete() && (
          <button
            className="btn-icon btn-delete"
            onClick={() => handleDelete(project.id)}
            title="Delete Project"
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
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="project-list-container">
      {/* Header with View Toggle */}
      <div className="project-list-header">
        <div className="header-left">
          <h1>Projets</h1>
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <ListIcon />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card View"
            >
              <GridIcon />
            </button>
          </div>
        </div>
        <div className="header-right">
          {selectedProjects.length > 0 && canDelete() && (
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

      {/* Enhanced Filters */}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Tous les Statuts</option>
            {PROJECT_STATUSES.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Tous les Types</option>
            {PROJECT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
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

      {/* Active Filters Display */}
      {(searchTerm || statusFilter || typeFilter) && (
        <div className="active-filters">
          <span className="filters-label">Filtres actifs :</span>
          {searchTerm && (
            <span className="filter-tag">
              Recherche: "{searchTerm}"
              <button onClick={() => setSearchTerm('')}>×</button>
            </span>
          )}
          {statusFilter && (
            <span className="filter-tag">
              Statut: {statusFilter}
              <button onClick={() => setStatusFilter('')}>×</button>
            </span>
          )}
          {typeFilter && (
            <span className="filter-tag">
              Type: {typeFilter}
              <button onClick={() => setTypeFilter('')}>×</button>
            </span>
          )}
        </div>
      )}

      {/* Content Area */}
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
                        setSelectedProjects(filteredProjects.map(p => p.id));
                      }
                    }}
                  />
                </th>
                <th>Nom</th>
                <th>Type</th>
                <th>Progrès</th>
                <th>Date d'échéance</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => (
                <tr key={project.id} className={selectedProjects.includes(project.id) ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => handleSelectProject(project.id)}
                    />
                  </td>
                  <td>
                    <div className="project-name-cell">
                      <strong>{project.name}</strong>
                      <small>{project.description}</small>
                    </div>
                  </td>
                  <td>{project.type}</td>
                  <td>
                    <div className="progress-cell">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${Number(project.progress) || 0}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{project.progress}%</span>
                    </div>
                  </td>
                  <td>{formatDate(project.due_date)}</td>
                  <td>
                    <span className={`status-badge status-${project.status}`}>
                      {project.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-secondary btn-small"
                        onClick={() => handleView(project.id)}
                      >
                        Voir
                      </button>
                      {canEdit(project) && (
                        <button
                          className="btn-secondary btn-small"
                          onClick={() => handleEdit(project.id)}
                        >
                          Modifier
                        </button>
                      )}
                      {canDelete() && (
                        <button
                          className="btn-danger btn-small"
                          onClick={() => handleDelete(project.id)}
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
