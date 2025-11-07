import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { projectService } from '../../services/api';
import './ProjectUpload.css';

const ProjectUpload = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, clearError } = useProject();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);

  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'text/csv'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (fileList) => {
    const validFiles = fileList.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`Type de fichier non autorisé: ${file.name}`);
        return false;
      }
      if (file.size > maxFileSize) {
        alert(`Fichier trop volumineux: ${file.name} (max 10MB)`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
    setUploadError(null);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      console.log('❌ Aucun fichier à télécharger');
      return;
    }

    console.log('🎯 Démarrage du processus de téléchargement');
    console.log('   ID du projet:', id);
    console.log('   Fichiers à télécharger:', files);

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    clearError();

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      console.log('📤 Appel de uploadToProject...');
      const results = await projectService.uploadToProject(id, files);

      console.log('📥 Résultats de téléchargement reçus:', results);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResults(results);

      if (results.errors && results.errors.length > 0) {
        console.warn('⚠️ Certains fichiers ont échoué:', results.errors);
        setUploadError(`${results.errors.length} fichier(s) n'ont pas pu être téléchargé(s)`);
      } else {
        console.log('✅ Tous les fichiers ont été téléchargés avec succès!');
        setUploadSuccess(true);
      }

      console.log('⏱️ Redirection dans 3 secondes...');
      setTimeout(() => {
        setFiles([]);
        setUploadSuccess(false);
        setUploadProgress(0);
        setUploadResults(null);
        navigate(`/projects/${id}`);
      }, 3000);

    } catch (err) {
      console.error('💥 Le téléchargement a échoué:', err);
      console.error('   Message d\'erreur:', err.message);
      console.error('   Réponse d\'erreur:', err.response?.data);
      setUploadError(err.response?.data?.detail || err.message || 'Le téléchargement a échoué');
      setUploadProgress(0);
    } finally {
      setUploading(false);
      console.log('🏁 Processus de téléchargement terminé');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return '📊';
    } else if (fileType.includes('pdf')) {
      return '📄';
    } else if (fileType.includes('image')) {
      return '🖼️';
    } else {
      return '📁';
    }
  };

  return (
    <div className="project-upload-container">
      <div className="upload-header">
        <h1>Télécharger des Fichiers</h1>
        <p>Téléchargez des fichiers Excel, PDF, des images et des fichiers texte pour traiter les actifs du projet.</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {uploadError && (
        <div className="error-message">
          {uploadError}
        </div>
      )}

      {uploadSuccess && (
        <div className="success-message">
          Fichiers téléchargés avec succès ! Redirection en cours...
        </div>
      )}

      {uploadResults && (
        <div className="upload-results">
          {uploadResults.excel_files && uploadResults.excel_files.length > 0 && (
            <div className="result-section">
              <h3>📊 Fichiers Excel ({uploadResults.excel_files.length})</h3>
              {uploadResults.excel_files.map((file, idx) => (
                <div key={idx} className="result-item">
                  <strong>{file.file_name}</strong>
                  <p>Fichier traité avec succès</p>
                </div>
              ))}
            </div>
          )}

          {uploadResults.pdf_files && uploadResults.pdf_files.length > 0 && (
            <div className="result-section">
              <h3>📄 Fichiers PDF ({uploadResults.pdf_files.length})</h3>
              {uploadResults.pdf_files.map((file, idx) => (
                <div key={idx} className="result-item">
                  <strong>{file.file_name}</strong>
                  <p>Fichier traité avec succès</p>
                </div>
              ))}
            </div>
          )}

          {uploadResults.other_files && uploadResults.other_files.length > 0 && (
            <div className="result-section">
              <h3>📁 Autres Fichiers ({uploadResults.other_files.length})</h3>
              {uploadResults.other_files.map((file, idx) => (
                <div key={idx} className="result-item">
                  <strong>{file.file_name}</strong>
                  <p>Fichier téléchargé avec succès</p>
                </div>
              ))}
            </div>
          )}

          {uploadResults.errors && uploadResults.errors.length > 0 && (
            <div className="result-section error">
              <h3>❌ Téléchargements Échoués ({uploadResults.errors.length})</h3>
              {uploadResults.errors.map((error, idx) => (
                <div key={idx} className="result-item">
                  <strong>{error.file_name}</strong>
                  <p className="error-text">{error.error}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="upload-zone">
        <div
          className={`drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="drop-zone-content">
            <div className="upload-icon">📁</div>
            <h3>Déposez les fichiers ici ou cliquez pour parcourir</h3>
            <p>Formats supportés: Excel (.xlsx, .xls), PDF, Images (JPG, PNG, GIF), Fichiers texte</p>
            <p className="file-limit">Taille maximale: 10MB par fichier</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xlsx,.xls,.pdf,.jpg,.jpeg,.png,.gif,.txt,.csv"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <h3>Fichiers Sélectionnés ({files.length})</h3>
          <div className="file-items">
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-info">
                  <span className="file-icon">{getFileIcon(file.type)}</span>
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                </div>
                <button
                  className="remove-file-btn"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  type="button"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="progress-text">Téléchargement en cours... {uploadProgress}%</span>
            </div>
          )}

          <div className="upload-actions">
            <button
              className="btn-secondary"
              onClick={() => setFiles([])}
              disabled={uploading}
              type="button"
            >
              Effacer Tout
            </button>
            <button
              className="btn-primary"
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              type="button"
            >
              {uploading ? 'Téléchargement...' : `Télécharger ${files.length} Fichier${files.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      <div className="upload-footer">
        <button
          className="btn-secondary"
          onClick={() => navigate(`/projects/${id}`)}
          disabled={uploading}
          type="button"
        >
          Retour au Projet
        </button>
      </div>
    </div>
  );
};

export default ProjectUpload;
