import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { projectService } from '../../services/projectService';
import './ProjectUpload.css';

const ProjectUpload = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error } = useProject();
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
        alert(`File type not allowed: ${file.name}`);
        return false;
      }
      if (file.size > maxFileSize) {
        alert(`File too large: ${file.name} (max 10MB)`);
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
      console.log('❌ No files to upload');
      return;
    }

    console.log('🎯 Starting upload process');
    console.log('   Project ID:', id);
    console.log('   Files to upload:', files);

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

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

      console.log('📤 Calling uploadToProject...');
      const results = await projectService.uploadToProject(id, files);

      console.log('📥 Upload results received:', results);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResults(results);
      
      if (results.errors.length > 0) {
        console.warn('⚠️ Some files failed to upload:', results.errors);
        setUploadError(`${results.errors.length} file(s) failed to upload`);
      } else {
        console.log('✅ All files uploaded successfully!');
        setUploadSuccess(true);
      }

      console.log('⏱️ Redirecting in 3 seconds...');
      setTimeout(() => {
        setFiles([]);
        setUploadSuccess(false);
        setUploadProgress(0);
        setUploadResults(null);
        navigate(`/projects/${id}`);
      }, 3000);

    } catch (err) {
      console.error('💥 Upload failed with error:', err);
      console.error('   Error message:', err.message);
      console.error('   Error response:', err.response);
      setUploadError(err.message || 'Upload failed');
      setUploadProgress(0);
    } finally {
      setUploading(false);
      console.log('🏁 Upload process finished');
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
      return '📄';
    }
  };

  return (
    <div className="project-upload-container">
      <div className="upload-header">
        <h1>Upload Files to Project</h1>
        <p>Upload Excel, PDF, images, and text files to process project assets.</p>
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
          Files uploaded successfully! Redirecting...
        </div>
      )}

      {uploadResults && (
        <div className="upload-results">
          {uploadResults.excel_files.length > 0 && (
            <div className="result-section">
              <h3>📊 Excel Files ({uploadResults.excel_files.length})</h3>
              {uploadResults.excel_files.map((file, idx) => (
                <div key={idx} className="result-item">
                  <strong>{file.file_name}</strong>
                  <p>{file.data.nombre_feuilles} sheet(s) processed</p>
                </div>
              ))}
            </div>
          )}
          
          {uploadResults.pdf_files.length > 0 && (
            <div className="result-section">
              <h3>📄 PDF Files ({uploadResults.pdf_files.length})</h3>
              {uploadResults.pdf_files.map((file, idx) => (
                <div key={idx} className="result-item">
                  <strong>{file.file_name}</strong>
                  <p>{file.data.nb_pages} page(s), {file.data.nb_images} image(s), {file.data.nb_tableaux} table(s)</p>
                </div>
              ))}
            </div>
          )}
          
          {uploadResults.other_files.length > 0 && (
            <div className="result-section">
              <h3>📁 Other Files ({uploadResults.other_files.length})</h3>
              {uploadResults.other_files.map((file, idx) => (
                <div key={idx} className="result-item">
                  <strong>{file.file_name}</strong>
                </div>
              ))}
            </div>
          )}
          
          {uploadResults.errors.length > 0 && (
            <div className="result-section error">
              <h3>❌ Failed Uploads ({uploadResults.errors.length})</h3>
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
            <h3>Drop files here or click to browse</h3>
            <p>Supported formats: Excel (.xlsx, .xls), PDF, Images (JPG, PNG, GIF), Text files</p>
            <p className="file-limit">Maximum file size: 10MB per file</p>
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
          <h3>Selected Files ({files.length})</h3>
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
              <span className="progress-text">Uploading... {uploadProgress}%</span>
            </div>
          )}

          <div className="upload-actions">
            <button
              className="btn-secondary"
              onClick={() => setFiles([])}
              disabled={uploading}
            >
              Clear All
            </button>
            <button
              className="btn-primary"
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      <div className="upload-footer">
        <button
          className="btn-secondary"
          onClick={() => navigate(`/projects/${id}`)}
          disabled={uploading}
        >
          Back to Project
        </button>
      </div>
    </div>
  );
};

export default ProjectUpload;
