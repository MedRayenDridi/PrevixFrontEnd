import React, { useState, useRef, useEffect } from 'react';
import { manusService } from '../services/api';
import './ManusReport.css';

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
    <polyline points="13 2 13 9 20 9"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export const ManusReport = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Allowed file types
  const allowedTypes = [
    'application/pdf', // PDF
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/acad', // AutoCAD
    'application/x-dwg', // AutoCAD
    'image/vnd.dwg', // AutoCAD
  ];

  const allowedExtensions = ['.pdf', '.xlsx', '.xls', '.dwg', '.dxf'];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileType = (filename) => {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (ext === '.pdf') return 'PDF';
    if (ext === '.xlsx' || ext === '.xls') return 'Excel';
    if (ext === '.dwg' || ext === '.dxf') return 'AutoCAD';
    return 'Autre';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (fileList) => {
    const validFiles = fileList.filter(file => {
      const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!allowedExtensions.includes(ext)) {
        alert(`Type de fichier non autorisé: ${file.name}\nTypes acceptés: PDF, Excel (.xlsx, .xls), AutoCAD (.dwg, .dxf)`);
        return false;
      }
      return true;
    });

    setFiles(prev => {
      const newFiles = [...prev, ...validFiles];
      // Remove duplicates by name
      const uniqueFiles = newFiles.filter((file, index, self) =>
        index === self.findIndex(f => f.name === file.name)
      );
      return uniqueFiles;
    });
    setError(null);
    setSuccess(false);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (files.length === 0) {
      setError('Veuillez sélectionner au moins un fichier');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      // Generate report
      const blob = await manusService.generateReport(
        files,
        projectName || null,
        null // projectId - can be added later if needed
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport_valuation_ia_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setFiles([]);
      setProjectName('');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error generating Valuation IA report:', err);
      
      // Try to extract error message from response
      let errorMessage = 'Une erreur est survenue lors de la génération du rapport.';
      
      if (err.response) {
        // If response has data (JSON error)
        if (err.response.data) {
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } else if (err.response.data.detail) {
            errorMessage = err.response.data.detail;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          }
        }
        // If response has status text
        if (err.response.statusText && errorMessage === 'Une erreur est survenue lors de la génération du rapport.') {
          errorMessage = `${err.response.status} ${err.response.statusText}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (dropZone) {
      dropZone.addEventListener('dragover', handleDragOver);
      dropZone.addEventListener('dragleave', handleDragLeave);
      dropZone.addEventListener('drop', handleDrop);
    }
    return () => {
      if (dropZone) {
        dropZone.removeEventListener('dragover', handleDragOver);
        dropZone.removeEventListener('dragleave', handleDragLeave);
        dropZone.removeEventListener('drop', handleDrop);
      }
    };
  }, []);

  return (
    <div className="manus-report-container">
      {/* Header */}
      <div className="manus-header">
        <div className="manus-header-content">
          <div className="manus-icon">
            <SparklesIcon />
          </div>
          <div className="manus-title-section">
            <h1 className="manus-title">Valuation IA</h1>
            <p className="manus-subtitle">
              Téléchargez vos fichiers (PDF, Excel, AutoCAD) pour générer un rapport de valorisation automatique avec calculs IFRS 13
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="manus-content">
        {/* Project Name Input */}
        <div className="manus-project-input">
          <label htmlFor="project-name" className="manus-label">
            Nom du projet (optionnel)
          </label>
          <input
            id="project-name"
            type="text"
            className="manus-input"
            placeholder="Ex: Projet de valorisation 2024"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>

        {/* File Upload Zone */}
        <div 
          ref={dropZoneRef}
          className={`manus-dropzone ${isDragging ? 'dragging' : ''} ${files.length > 0 ? 'has-files' : ''}`}
        >
          {isDragging && (
            <div className="manus-drag-overlay">
              <div className="manus-drag-content">
                <FileIcon />
                <p>Déposez vos fichiers ici</p>
              </div>
            </div>
          )}

          {files.length === 0 ? (
            <div className="manus-dropzone-empty">
              <FileIcon />
              <h3>Glissez-déposez vos fichiers ici</h3>
              <p>ou</p>
              <button
                className="manus-browse-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Parcourir les fichiers
              </button>
              <p className="manus-file-types">
                Types acceptés: PDF, Excel (.xlsx, .xls), AutoCAD (.dwg, .dxf)
              </p>
            </div>
          ) : (
            <div className="manus-files-list">
              <h3 className="manus-files-title">
                {files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}
              </h3>
              <div className="manus-files-grid">
                {files.map((file, index) => (
                  <div key={index} className="manus-file-item">
                    <div className="manus-file-icon">
                      <FileIcon />
                    </div>
                    <div className="manus-file-info">
                      <div className="manus-file-name">{file.name}</div>
                      <div className="manus-file-details">
                        <span className="manus-file-type">{getFileType(file.name)}</span>
                        <span className="manus-file-size">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    <button
                      className="manus-file-remove"
                      onClick={() => removeFile(index)}
                      title="Supprimer"
                    >
                      <XIcon />
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="manus-add-more-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                + Ajouter d'autres fichiers
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls,.dwg,.dxf"
            onChange={handleFileSelect}
            className="manus-file-input"
          />
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="manus-message manus-error">
            <XIcon />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="manus-message manus-success">
            <CheckIcon />
            <span>Rapport généré avec succès ! Le téléchargement a commencé.</span>
          </div>
        )}

        {/* Generate Button */}
        <div className="manus-actions">
          <button
            className="manus-generate-btn"
            onClick={handleGenerate}
            disabled={files.length === 0 || isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="manus-spinner"></div>
                <span>Génération en cours...</span>
              </>
            ) : (
              <>
                <DownloadIcon />
                <span>Générer le rapport Valuation IA</span>
              </>
            )}
          </button>
        </div>

        {/* Info Section */}
        <div className="manus-info">
          <h3 className="manus-info-title">Comment ça fonctionne ?</h3>
          <div className="manus-info-steps">
            <div className="manus-info-step">
              <div className="manus-step-number">1</div>
              <div className="manus-step-content">
                <h4>Téléchargez vos fichiers</h4>
                <p>Ajoutez tous vos fichiers (PDF, Excel, AutoCAD) ensemble pour une analyse complète</p>
              </div>
            </div>
            <div className="manus-info-step">
              <div className="manus-step-number">2</div>
              <div className="manus-step-content">
                <h4>Traitement par Valuation IA prompting</h4>
                <p>Valuation IA prompting analyse tous les fichiers ensemble pour des calculs plus précis</p>
              </div>
            </div>
            <div className="manus-info-step">
              <div className="manus-step-number">3</div>
              <div className="manus-step-content">
                <h4>Rapport Excel généré</h4>
                <p>Recevez un rapport Excel complet avec tous les calculs IFRS 13, sans sauvegarder en base de données</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManusReport;
