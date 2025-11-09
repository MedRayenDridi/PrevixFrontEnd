import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProject } from '../../../context/ProjectContext';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import './ProjectForm.css';


const PROJECT_TYPES = ['IFRS', 'Assurance', 'Risk_Survey', 'Other'];
const PROJECT_STATUSES = ['active', 'archived', 'completed'];


const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { user, isAdmin } = useAuth();
  const { 
    createProject, 
    updateProject, 
    getProject,
    loading, 
    error, 
    clearError 
  } = useProject();


  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type_project: 'IFRS',
    status: 'active',
    progress: 0,
    due_date: '',
    org_id: null,
    assigned_to: null,
  });


  const [organizations, setOrganizations] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);


  // Load organizations and users on mount
  useEffect(() => {
    loadOrganizationsAndUsers();
  }, []);


  // Load project if editing
  useEffect(() => {
    if (isEdit && id) {
      loadProject();
    }
  }, [isEdit, id, getProject]);


  const loadOrganizationsAndUsers = async () => {
    setIsLoadingData(true);
    setDataError(null);
    
    try {
      // Fetch organizations
      const orgsResponse = await api.get('/organizations');
      const orgsData = orgsResponse.data.data || orgsResponse.data;
      setOrganizations(Array.isArray(orgsData) ? orgsData : []);

      // Fetch users
      const usersResponse = await api.get('/admin/users');
      const usersData = usersResponse.data.data || usersResponse.data;
      setAvailableUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('Échec du chargement des organisations et utilisateurs:', err);
      setDataError('Impossible de charger les organisations et utilisateurs');
      
      // Fallback to empty arrays
      setOrganizations([]);
      setAvailableUsers([]);
    } finally {
      setIsLoadingData(false);
    }
  };


  const loadProject = async () => {
    try {
      const project = await getProject(id);
      setFormData({
        name: project.name || '',
        description: project.description || '',
        type_project: project.type_project || 'IFRS',
        status: project.status || 'active',
        progress: project.progress || 0,
        due_date: project.due_date ? new Date(project.due_date).toISOString().split('T')[0] : '',
        org_id: project.org_id || null,
        assigned_to: project.assigned_to || null,
      });
    } catch (err) {
      console.error('Échec du chargement du projet:', err);
    }
  };


  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value) : null) : value
    }));


    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };


  const validateForm = () => {
    const errors = {};


    if (!formData.name.trim()) {
      errors.name = 'Le nom du projet est requis';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Le nom doit contenir au moins 3 caractères';
    }


    if (!formData.description.trim()) {
      errors.description = 'La description est requise';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'La description doit contenir au moins 10 caractères';
    }


    if (!formData.type_project) {
      errors.type_project = 'Le type de projet est requis';
    }


    if (!formData.due_date) {
      errors.due_date = 'La date d\'échéance est requise';
    } else {
      const dueDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        errors.due_date = 'La date d\'échéance doit être dans le futur';
      }
    }


    if (!formData.org_id) {
      errors.org_id = 'L\'organisation est requise';
    }


    if (formData.progress < 0 || formData.progress > 100) {
      errors.progress = 'Le progrès doit être entre 0 et 100';
    }


    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!validateForm()) {
      return;
    }


    setIsSubmitting(true);
    clearError();


    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type_project: formData.type_project,
        status: formData.status,
        progress: formData.progress,
        due_date: new Date(formData.due_date).toISOString(),
        org_id: formData.org_id,
        assigned_to: formData.assigned_to || null,
      };


      if (isEdit) {
        await updateProject(id, submitData);
        navigate(`/projects/${id}`);
      } else {
        const newProject = await createProject(submitData);
        navigate(`/projects/${newProject.project_id}`);
      }
    } catch (err) {
      console.error('Échec de la sauvegarde du projet:', err);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleCancel = () => {
    if (isEdit) {
      navigate(`/projects/${id}`);
    } else {
      navigate('/projects');
    }
  };


  const getTypeLabel = (type) => {
    const labels = {
      'IFRS': 'IFRS',
      'Assurance': 'Assurance',
      'Risk_Survey': 'Enquête de Risque',
      'Other': 'Autre'
    };
    return labels[type] || type;
  };


  const getStatusLabel = (status) => {
    const labels = {
      'active': 'Actif',
      'archived': 'Archivé',
      'completed': 'Complété'
    };
    return labels[status] || status;
  };


  const getOrgName = (orgId) => {
    const org = organizations.find(o => o.org_id === orgId);
    return org ? org.organization_name : 'Non spécifié';
  };


  const getUserName = (userId) => {
    const u = availableUsers.find(user => user.user_id === userId);
    return u ? u.full_name : 'Non spécifié';
  };


  // Show loading state
  if (isLoadingData) {
    return (
      <div className="project-form-container">
        <div className="project-form-header">
          <h1>Chargement...</h1>
        </div>
        <div className="project-form loading-state">
          <p>Chargement des organisations et utilisateurs...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="project-form-container">
      <div className="project-form-header">
        <h1>{isEdit ? 'Modifier le Projet' : 'Créer un Nouveau Projet'}</h1>
      </div>


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {dataError && (
        <div className="error-message">
          ⚠ {dataError}
        </div>
      )}


      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Nom du Projet *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={validationErrors.name ? 'error' : ''}
              placeholder="Entrez le nom du projet"
              required
              disabled={isSubmitting}
            />
            {validationErrors.name && <span className="error-text">{validationErrors.name}</span>}
          </div>


          <div className="form-group">
            <label htmlFor="type_project">Type de Projet *</label>
            <select
              id="type_project"
              name="type_project"
              value={formData.type_project}
              onChange={handleInputChange}
              className={validationErrors.type_project ? 'error' : ''}
              required
              disabled={isSubmitting}
            >
              <option value="">Sélectionner un type</option>
              {PROJECT_TYPES.map(type => (
                <option key={type} value={type}>
                  {getTypeLabel(type)}
                </option>
              ))}
            </select>
            {validationErrors.type_project && <span className="error-text">{validationErrors.type_project}</span>}
          </div>
        </div>


        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={6}
            className={validationErrors.description ? 'error' : ''}
            placeholder="Entrez la description du projet"
            required
            disabled={isSubmitting}
          />
          {validationErrors.description && <span className="error-text">{validationErrors.description}</span>}
        </div>


        <div className="form-row">
          <div className="form-group">
            <label htmlFor="org_id">Organisation *</label>
            <select
              id="org_id"
              name="org_id"
              value={formData.org_id || ''}
              onChange={handleInputChange}
              className={validationErrors.org_id ? 'error' : ''}
              required
              disabled={isSubmitting}
            >
              <option value="">Sélectionner une organisation</option>
              {organizations.length > 0 ? (
                organizations.map(org => (
                  <option key={org.org_id} value={org.org_id}>
                    {org.organization_name}
                  </option>
                ))
              ) : (
                <option disabled>Aucune organisation disponible</option>
              )}
            </select>
            {validationErrors.org_id && <span className="error-text">{validationErrors.org_id}</span>}
          </div>


          <div className="form-group">
            <label htmlFor="due_date">Date d'Échéance *</label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleInputChange}
              className={validationErrors.due_date ? 'error' : ''}
              required
              disabled={isSubmitting}
            />
            {validationErrors.due_date && <span className="error-text">{validationErrors.due_date}</span>}
          </div>
        </div>


        <div className="form-row">
          <div className="form-group">
            <label htmlFor="progress">Progrès (%)</label>
            <input
              type="number"
              id="progress"
              name="progress"
              min="0"
              max="100"
              value={formData.progress}
              onChange={handleInputChange}
              className={validationErrors.progress ? 'error' : ''}
              placeholder="0-100"
              disabled={isSubmitting}
            />
            {validationErrors.progress && <span className="error-text">{validationErrors.progress}</span>}
          </div>


          <div className="form-group">
            <label htmlFor="status">Statut</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={(!isAdmin() && isEdit) || isSubmitting}
            >
              {PROJECT_STATUSES.map(status => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
            {!isAdmin() && isEdit && (
              <small className="form-help">Seuls les administrateurs peuvent changer le statut</small>
            )}
          </div>


          <div className="form-group">
            <label htmlFor="assigned_to">Assigné à</label>
            <select
              id="assigned_to"
              name="assigned_to"
              value={formData.assigned_to || ''}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              <option value="">Aucun utilisateur</option>
              {availableUsers.length > 0 ? (
                availableUsers.map(u => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.full_name}
                  </option>
                ))
              ) : (
                <option disabled>Aucun utilisateur disponible</option>
              )}
            </select>
          </div>
        </div>


        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCancel}
            disabled={isSubmitting || loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? 'Enregistrement...' : (isEdit ? 'Mettre à jour le Projet' : 'Créer un Projet')}
          </button>
        </div>
      </form>
    </div>
  );
};


export default ProjectForm;
