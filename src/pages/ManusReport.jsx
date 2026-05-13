import React, { useState, useRef, useEffect } from 'react';
import { manusService } from '../services/api';
import { useReportGeneration } from '../context/ReportGenerationContext';
import { PlanViewer3D } from '../components/PlanViewer3D';
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
  const {
    status,
    result,
    errorMessage,
    isLoading,
    isLoadingExcel,
    isLoadingWord,
    isSuccess,
    isError,
    startExcelReport,
    startWordReport,
    clearReport,
  } = useReportGeneration();

  const [reportHistory, setReportHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isDescribingAutocad, setIsDescribingAutocad] = useState(false);
  const [autocadDescription, setAutocadDescription] = useState(null);
  const [autocadDescriptionError, setAutocadDescriptionError] = useState(null);
  const [autocadScene3d, setAutocadScene3d] = useState(null);
  const [projectName, setProjectName] = useState('');
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const hasAutocadFile = files.some((f) => /\.(dwg|dxf)$/i.test(f.name));
  const firstAutocadFile = hasAutocadFile ? files.find((f) => /\.(dwg|dxf)$/i.test(f.name)) : null;

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
  };

  const loadReportHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await manusService.listReportHistory();
      setReportHistory(Array.isArray(data?.reports) ? data.reports : []);
    } catch (err) {
      console.error('Report history load error:', err);
      const msg = err.response?.data?.detail || err.message || 'Impossible de charger l’historique.';
      setHistoryError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setReportHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDownloadHistory = async (reportId) => {
    if (!reportId) return;
    setDownloadingId(reportId);
    try {
      const { blob, filename } = await manusService.downloadHistoryReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `rapport_${reportId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('History download error:', err);
      const msg = err.response?.data?.detail || err.message || 'Téléchargement impossible.';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setDownloadingId(null);
    }
  };

  const formatHistoryDate = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return d.toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (autocadDescription !== null || autocadDescriptionError || autocadScene3d) {
      setAutocadDescription(null);
      setAutocadDescriptionError(null);
      setAutocadScene3d(null);
    }
  };

  const handleDescribeAutocad = async () => {
    if (!firstAutocadFile) return;
    setIsDescribingAutocad(true);
    setAutocadDescription(null);
    setAutocadDescriptionError(null);
    setAutocadScene3d(null);
    try {
      const result = await manusService.describeAutocad(firstAutocadFile);
      setAutocadDescription(result.description || '');
      if (result.scene_3d) setAutocadScene3d(result.scene_3d);
    } catch (err) {
      console.error('AutoCAD describe error:', err);
      const msg = err.response?.data?.detail || err.message || 'Erreur lors de la description du fichier AutoCAD.';
      setAutocadDescriptionError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsDescribingAutocad(false);
    }
  };

  const closeAutocadModal = () => {
    setAutocadDescription(null);
    setAutocadDescriptionError(null);
    setAutocadScene3d(null);
  };

  const handleGenerateExcel = () => {
    if (files.length === 0) return;
    startExcelReport(files, projectName || null);
  };

  const handleGeneratePdf = () => {
    if (files.length === 0) return;
    startWordReport(files, projectName || null);
  };

  const handleDownloadResult = () => {
    if (!result?.blob) return;
    const url = window.URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename || 'rapport_valuation_ia.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    clearReport();
    setFiles([]);
    setProjectName('');
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

  useEffect(() => {
    loadReportHistory();
  }, []);

  useEffect(() => {
    if (isSuccess && result?.type === 'excel') {
      loadReportHistory();
    }
  }, [isSuccess, result?.type]);

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
        {/* Report history */}
        <div className="manus-history-section">
          <div className="manus-history-header">
            <h2 className="manus-history-title">Historique des rapports Excel</h2>
            <button
              type="button"
              className="manus-history-refresh"
              onClick={loadReportHistory}
              disabled={historyLoading}
            >
              {historyLoading ? 'Chargement…' : 'Actualiser'}
            </button>
          </div>
          <p className="manus-history-hint">
            Les rapports générés avec succès sont enregistrés sur le serveur ; vous pouvez les télécharger à nouveau ici.
          </p>
          {historyError && (
            <div className="manus-message manus-error manus-history-error">
              <XIcon />
              <span>{historyError}</span>
            </div>
          )}
          {!historyError && reportHistory.length === 0 && !historyLoading && (
            <p className="manus-history-empty">Aucun rapport enregistré pour le moment.</p>
          )}
          {reportHistory.length > 0 && (
            <div className="manus-history-table-wrap">
              <table className="manus-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Projet</th>
                    <th>Fichiers sources</th>
                    <th>Taille</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {reportHistory.map((row) => (
                    <tr key={row.id}>
                      <td>{formatHistoryDate(row.created_at)}</td>
                      <td>{row.project_name || '—'}</td>
                      <td className="manus-history-sources" title={(row.source_files || []).join(', ')}>
                        {(row.source_files || []).length
                          ? `${(row.source_files || []).slice(0, 2).join(', ')}${
                              (row.source_files || []).length > 2 ? ` (+${(row.source_files || []).length - 2})` : ''
                            }`
                          : '—'}
                      </td>
                      <td>{formatFileSize(row.size_bytes || 0)}</td>
                      <td>
                        <button
                          type="button"
                          className="manus-history-download-btn"
                          onClick={() => handleDownloadHistory(row.id)}
                          disabled={downloadingId === row.id}
                        >
                          <DownloadIcon />
                          {downloadingId === row.id ? '…' : 'Télécharger'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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

        {/* Background loading notice */}
        {isLoading && (
          <div className="manus-message manus-info-bg">
            <div className="manus-spinner" />
            <span>
              {isLoadingExcel ? 'Génération du rapport Excel en cours…' : 'Génération du rapport Word en cours…'}
              Vous pouvez continuer à utiliser l'application ; une notification s'affichera à la fin.
            </span>
          </div>
        )}

        {/* Error from context (report generation) */}
        {isError && errorMessage && (
          <div className="manus-message manus-error">
            <XIcon />
            <span>{errorMessage}</span>
            <button type="button" className="manus-clear-error-btn" onClick={clearReport} aria-label="Fermer">Fermer</button>
          </div>
        )}

        {/* Success: report ready to download */}
        {isSuccess && result && (
          <div className="manus-message manus-success">
            <CheckIcon />
            <span>Rapport prêt ! Téléchargez-le ci-dessous.</span>
            <button type="button" className="manus-download-result-btn" onClick={handleDownloadResult}>
              <DownloadIcon />
              Télécharger {result.type === 'excel' ? 'Excel' : 'Word'}
            </button>
            <button type="button" className="manus-clear-success-btn" onClick={clearReport} aria-label="Fermer">Fermer</button>
          </div>
        )}

        {/* Generate Buttons */}
        <div className="manus-actions">
          <button
            className="manus-generate-btn"
            onClick={handleGenerateExcel}
            disabled={files.length === 0 || isLoading}
          >
            {isLoadingExcel ? (
              <>
                <div className="manus-spinner"></div>
                <span>Génération en arrière-plan…</span>
              </>
            ) : (
              <>
                <DownloadIcon />
                <span>Générer le rapport Excel</span>
              </>
            )}
          </button>
          <button
            className="manus-generate-btn manus-generate-btn-secondary"
            onClick={handleGeneratePdf}
            disabled={files.length === 0 || isLoading}
          >
            {isLoadingWord ? (
              <>
                <div className="manus-spinner"></div>
                <span>Génération en arrière-plan…</span>
              </>
            ) : (
              <>
                <DownloadIcon />
                <span>Générer le rapport Word</span>
              </>
            )}
          </button>
          <button
            type="button"
            className="manus-generate-btn manus-describe-autocad-btn"
            onClick={handleDescribeAutocad}
            disabled={!hasAutocadFile || isDescribingAutocad || isLoading}
            title={hasAutocadFile ? 'Décrire le fichier AutoCAD (extraction + IA)' : 'Ajoutez un fichier .dwg ou .dxf pour activer'}
          >
            {isDescribingAutocad ? (
              <>
                <div className="manus-spinner"></div>
                <span>Description en cours...</span>
              </>
            ) : (
              <>
                <SparklesIcon />
                <span>Décrire le fichier AutoCAD</span>
              </>
            )}
          </button>
        </div>

        {/* Modal: AutoCAD description + 3D plan */}
        {(autocadDescription !== null || autocadDescriptionError) && (
          <div className="manus-modal-overlay" onClick={closeAutocadModal} role="dialog" aria-modal="true">
            <div className="manus-modal manus-modal-with-3d" onClick={(e) => e.stopPropagation()}>
              <div className="manus-modal-header">
                <h3>Description et plan 3D – fichier AutoCAD</h3>
                <button type="button" className="manus-modal-close" onClick={closeAutocadModal} aria-label="Fermer">
                  <XIcon />
                </button>
              </div>
              <div className="manus-modal-body">
                {autocadDescriptionError ? (
                  <p className="manus-modal-error">{autocadDescriptionError}</p>
                ) : (
                  <>
                    <div className="manus-modal-section">
                      <h4 className="manus-modal-section-title">Description</h4>
                      <div className="manus-description-text">{autocadDescription}</div>
                    </div>
                    {autocadScene3d && (
                      <div className="manus-modal-section">
                        <h4 className="manus-modal-section-title">Vue 3D du plan</h4>
                        <PlanViewer3D scene_3d={autocadScene3d} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

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
                <p>Recevez un rapport Excel complet avec tous les calculs IFRS 13 ; une copie est conservée dans l&apos;historique ci-dessus pour re-téléchargement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManusReport;
