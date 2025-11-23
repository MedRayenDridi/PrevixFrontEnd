import { useState, useRef } from 'react';
import { api } from '../../services/api';
import './ClientProjectUploadArea.css';

/**
 * Drag-and-drop file upload component for client projects.
 * 
 * @param {Object} props
 * @param {number} [props.existingProjectId] - If provided, uploads to this project
 * @param {Function} [props.onProjectCreated] - Callback when new project is created
 * @param {Function} [props.onFilesUploaded] - Callback when files are uploaded
 */
const ClientProjectUploadArea = ({
  existingProjectId,
  onProjectCreated,
  onFilesUploaded
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const allowedTypes = ['.pdf', '.xlsx', '.xls', '.csv', '.dwg', '.dxf'];
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/acad',
    'application/x-dwg'
  ];

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const isValidType = allowedTypes.includes(ext) || allowedMimeTypes.includes(file.type);
    
    if (!isValidType) {
      return {
        valid: false,
        error: `Type de fichier non supporté: ${file.name}. Types acceptés: PDF, Excel (.xlsx, .xls, .csv), AutoCAD (.dwg, .dxf)`
      };
    }
    
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return {
        valid: false,
        error: `Fichier trop volumineux: ${file.name}. Taille maximale: 50MB`
      };
    }
    
    return { valid: true };
  };

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(validation.error);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    } else {
      setError(null);
      setFiles(prev => [...prev, ...validFiles]);
    }
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
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Veuillez sélectionner au moins un fichier');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      let response;
      if (existingProjectId) {
        // Upload to existing project
        response = await api.post(
          `/client/projects/${existingProjectId}/files/upload/`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        // Create new project and upload
        response = await api.post(
          '/client/projects/upload-and-create/',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            params: {
              project_type: 'IFRS',
              due_date_days: 90
            }
          }
        );
        
        // Callback for new project
        if (onProjectCreated && response.data.project_id) {
          onProjectCreated(response.data.project_id);
        }
      }

      setSuccess(`Fichiers envoyés avec succès (${response.data.files.length} fichier(s))`);
      setFiles([]);
      
      // Callback for uploaded files
      if (onFilesUploaded) {
        onFilesUploaded(response.data.files);
      }

    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          'Échec de l\'envoi des fichiers, veuillez réessayer';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="client-upload-area">
      <div
        className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        <div className="upload-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="upload-text">
            Déposer vos fichiers d'actifs ici ou cliquer pour sélectionner
          </p>
          <p className="upload-hint">
            Types acceptés: PDF, Excel (.xlsx, .xls, .csv), AutoCAD (.dwg, .dxf)
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <h4>Fichiers sélectionnés ({files.length})</h4>
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{formatFileSize(file.size)}</span>
              <button
                type="button"
                className="remove-file-btn"
                onClick={() => removeFile(index)}
                disabled={uploading}
              >
                ×
              </button>
            </div>
          ))}
          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
          >
            {uploading ? 'Envoi en cours...' : `Envoyer ${files.length} fichier(s)`}
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}
    </div>
  );
};

export default ClientProjectUploadArea;


