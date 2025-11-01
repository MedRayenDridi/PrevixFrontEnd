import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { PROJECT_TYPES, PROJECT_STATUSES } from '../../types/projectTypes';
import { adminService } from '../../services/api';
import './ProjectForm.css';

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { user } = useAuth();
  const { createProject, updateProject, currentProject, setCurrentProject, loading, error } = useProject();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'IFRS',
    progress: 0,
    assigned_to: [],
    client: '',
    due_date: '',
  });

  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsersAndClients = async () => {
      try {
        const userData = await adminService.getUsers();
        setUsers(userData);
        const clientData = await adminService.getClients();
        setClients(clientData);
      } catch (err) {
        console.error('Échec de la récupération des utilisateurs et clients :', err);
      }
    };

    if (user.role === 'admin') {
      fetchUsersAndClients();
    }

    if (isEdit) {
      // In a real app, you'd fetch the project by ID
      // For now, we'll assume currentProject is set
      if (currentProject) {
        let clientValue = currentProject.client || '';
        // Extract email from display format "name (email)" if necessary
        if (clientValue.includes('(') && clientValue.includes(')')) {
          const match = clientValue.match(/\(([^)]+)\)/);
          if (match) clientValue = match[1];
        }
        setFormData({
          name: currentProject.name || '',
          description: currentProject.description || '',
          type: currentProject.type || 'IFRS',
          progress: currentProject.progress || 0,
          assigned_to: currentProject.assigned_to || [],
          client: clientValue,
          due_date: currentProject.due_date ? currentProject.due_date.split('T')[0] : '',
        });
      }
    }
  }, [isEdit, currentProject, user.role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const values = Array.from(options).filter(option => option.selected).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      [name]: values
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom du projet est requis';
    }

    if (!formData.description.trim()) {
      errors.description = 'La description est requise';
    }

    if (!formData.client) {
      errors.client = 'Le client est requis';
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

    try {
      const submitData = {
        ...formData,
        progress: parseInt(formData.progress),
        assigned_to: Array.isArray(formData.assigned_to) ? formData.assigned_to : [],
      };

      if (isEdit) {
        await updateProject(id, submitData);
        navigate(`/projects/${id}`);
      } else {
        const newProject = await createProject(submitData);
        navigate(`/projects/${newProject.id}`);
      }
    } catch (err) {
      console.error('Échec de la sauvegarde du projet :', err);
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

  const getAvailableClients = () => {
    if (!Array.isArray(clients)) return [];
    return clients;
  };

  const getAvailableCollaborators = () => {
    if (!Array.isArray(users)) return [];
    return users.filter(u => u.role === 'collaborator');
  };

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

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-group">
          <label htmlFor="name">Nom du Projet *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={validationErrors.name ? 'error' : ''}
            required
          />
          {validationErrors.name && <span className="error-text">{validationErrors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className={validationErrors.description ? 'error' : ''}
            required
          />
          {validationErrors.description && <span className="error-text">{validationErrors.description}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              {PROJECT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
          <label htmlFor="progress">Progrès (%)</label>
            <input
              type="number"
              id="progress"
              name="progress"
              value={formData.progress}
              onChange={handleInputChange}
              min="0"
              max="100"
              className={validationErrors.progress ? 'error' : ''}
            />
            {validationErrors.progress && <span className="error-text">{validationErrors.progress}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="client">Client *</label>
            <select
              id="client"
              name="client"
              value={formData.client}
              onChange={handleInputChange}
              className={validationErrors.client ? 'error' : ''}
              required
            >
              <option value="">Sélectionner un client</option>
              {getAvailableClients().map(client => (
                <option key={client.id} value={client.email}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
            {validationErrors.client && <span className="error-text">{validationErrors.client}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Date d'échéance *</label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleInputChange}
              className={validationErrors.due_date ? 'error' : ''}
              required
            />
            {validationErrors.due_date && <span className="error-text">{validationErrors.due_date}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="assigned_to">Assigné à</label>
          <select
            id="assigned_to"
            name="assigned_to"
            multiple
            value={formData.assigned_to}
            onChange={handleMultiSelectChange}
            size={4}
          >
            {getAvailableCollaborators().map(collaborator => (
              <option key={collaborator.email} value={collaborator.email}>
                {collaborator.name} ({collaborator.email})
              </option>
            ))}
          </select>
          <small className="form-help">Maintenez Ctrl/Cmd pour sélectionner plusieurs collaborateurs</small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
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
