import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../../services/projectService';
import './ClientProjectDetail.css';

const ArrowBackIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
  </svg>
);

const PdfIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
  </svg>
);

const ExcelIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-2 15h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2z" />
  </svg>
);

const ClientProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await projectService.getProject(id);
        if (!cancelled) setProject(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.detail || err.message || 'Impossible de charger le projet');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (id) fetchProject();
    return () => { cancelled = true; };
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDownloadPdf = () => {
    // Placeholder: will be implemented later
  };

  const handleDownloadExcel = () => {
    // Placeholder: will be implemented later
  };

  if (loading) {
    return (
      <div className="client-project-detail">
        <div className="client-detail-loading">
          <div className="client-detail-spinner" />
          <p>Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="client-project-detail">
        <button type="button" className="client-detail-back" onClick={() => navigate('/projects')}>
          <ArrowBackIcon /> Retour aux projets
        </button>
        <div className="client-detail-error">
          <p>{error || 'Projet introuvable.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-project-detail">
      <button type="button" className="client-detail-back" onClick={() => navigate('/projects')}>
        <ArrowBackIcon /> Retour aux projets
      </button>

      <div className="client-detail-card">
        <div className="client-detail-header">
          <span className="client-detail-icon">
            <FolderIcon />
          </span>
          <div className="client-detail-title-block">
            <h1 className="client-detail-title">{project.name}</h1>
            <span className={`client-detail-status status-${project.status || 'active'}`}>
              {project.status === 'active' ? 'Actif' : project.status === 'completed' ? 'Terminé' : project.status || 'Actif'}
            </span>
          </div>
        </div>

        <div className="client-detail-info">
          {project.description && (
            <div className="client-detail-row">
              <span className="client-detail-label">Description</span>
              <p className="client-detail-value client-detail-desc">{project.description}</p>
            </div>
          )}
          <div className="client-detail-grid">
            <div className="client-detail-row">
              <span className="client-detail-label">Type</span>
              <span className="client-detail-value">{project.type_project || '—'}</span>
            </div>
            <div className="client-detail-row">
              <span className="client-detail-label">Échéance</span>
              <span className="client-detail-value">{formatDate(project.due_date)}</span>
            </div>
            <div className="client-detail-row">
              <span className="client-detail-label">Progression</span>
              <span className="client-detail-value">{project.progress ?? 0}%</span>
            </div>
          </div>
          <div className="client-detail-progress-bar">
            <div className="client-detail-progress-fill" style={{ width: `${project.progress ?? 0}%` }} />
          </div>
        </div>

        <div className="client-detail-downloads">
          <h2 className="client-detail-downloads-title">Téléchargements</h2>
          <div className="client-detail-download-buttons">
            <button type="button" className="client-detail-btn-download" onClick={handleDownloadPdf}>
              <PdfIcon />
              <span>Télécharger PDF</span>
            </button>
            <button type="button" className="client-detail-btn-download" onClick={handleDownloadExcel}>
              <ExcelIcon />
              <span>Télécharger Excel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProjectDetail;
