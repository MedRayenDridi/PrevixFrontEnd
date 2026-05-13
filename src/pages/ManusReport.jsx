import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { manusService, projectService } from '../services/api';
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

const WB_ROWS_PER_PAGE = 100;

const colExcelLabel = (index) => {
  let s = '';
  let n = index;
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
};

const projectRowId = (p) => p?.project_id ?? p?.id;
const projectRowLabel = (p) => p?.name || p?.title || `Projet ${projectRowId(p)}`;

const WB_EDITOR_INIT = {
  open: false,
  reportId: null,
  loading: false,
  saving: false,
  error: null,
  sheets: [],
  activeSheetIdx: 0,
  rowPage: 0,
  totalCells: 0,
};

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
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [assigningReportId, setAssigningReportId] = useState(null);
  const [workbookEditor, setWorkbookEditor] = useState(WB_EDITOR_INIT);
  const [aiDiagnosticModal, setAiDiagnosticModal] = useState(null);
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
    startExcelReport(files, projectName || null, selectedProjectId || null);
  };

  const handleAssignHistoryProject = async (reportId, rawVal) => {
    setAssigningReportId(reportId);
    try {
      const pid = rawVal === '' || rawVal == null ? null : Number(rawVal);
      await manusService.patchReportProject(reportId, Number.isNaN(pid) ? null : pid);
      await loadReportHistory();
    } catch (err) {
      console.error('Assign project to report:', err);
      const msg = err.response?.data?.detail || err.message || 'Impossible de mettre à jour le projet.';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setAssigningReportId(null);
    }
  };

  const closeAiDiagnosticModal = () => setAiDiagnosticModal(null);

  const openAiDiagnosticModal = (row) => {
    setAiDiagnosticModal({
      id: row.id,
      label:
        row.download_filename ||
        row.project_label_resolved ||
        row.project_label ||
        row.project_name ||
        row.id,
    });
  };

  const closeWorkbookEditor = () => {
    setWorkbookEditor(WB_EDITOR_INIT);
  };

  const openWorkbookEditor = async (reportId) => {
    setWorkbookEditor({
      ...WB_EDITOR_INIT,
      open: true,
      reportId,
      loading: true,
    });
    try {
      const data = await manusService.getReportWorkbook(reportId);
      const raw = data.sheets || [];
      const sheets = JSON.parse(
        JSON.stringify(
          raw.map((s) => ({
            name: s.name || 'Feuille',
            rows: Array.isArray(s.rows) ? s.rows : [],
          }))
        )
      );
      setWorkbookEditor((w) => ({
        ...w,
        loading: false,
        sheets,
        totalCells: typeof data.total_cells === 'number' ? data.total_cells : 0,
        activeSheetIdx: 0,
        rowPage: 0,
        error: null,
      }));
    } catch (err) {
      console.error('Workbook load:', err);
      const detail = err.response?.data?.detail;
      const msg =
        err.response?.status === 413
          ? typeof detail === 'string'
            ? detail
            : 'Classeur trop volumineux pour l’éditeur web. Modifiez-le dans Excel puis importez à nouveau, ou téléchargez la version actuelle.'
          : detail || err.message || 'Impossible de charger le classeur.';
      setWorkbookEditor((w) => ({
        ...w,
        loading: false,
        error: typeof msg === 'string' ? msg : JSON.stringify(msg),
        sheets: [],
      }));
    }
  };

  const updateWorkbookCell = (sheetIdx, rowIdx, colIdx, value) => {
    setWorkbookEditor((w) => {
      if (!w.open || sheetIdx < 0 || sheetIdx >= w.sheets.length) return w;
      const sheets = w.sheets.map((s, si) => {
        if (si !== sheetIdx) return s;
        const rows = s.rows.map((r, ri) => {
          if (ri !== rowIdx) return r;
          const nr = [...(Array.isArray(r) ? r : [])];
          while (nr.length <= colIdx) nr.push('');
          nr[colIdx] = value;
          return nr;
        });
        return { ...s, rows };
      });
      return { ...w, sheets };
    });
  };

  const handleSaveWorkbook = async () => {
    const { reportId, sheets } = workbookEditor;
    if (!reportId || !sheets.length) return;
    setWorkbookEditor((w) => ({ ...w, saving: true, error: null }));
    try {
      const payload = {
        sheets: sheets.map((s) => ({
          name: s.name,
          rows: (s.rows || []).map((row) => (Array.isArray(row) ? row : [])),
        })),
      };
      await manusService.saveReportWorkbook(reportId, payload);
      await loadReportHistory();
      alert('Modifications enregistrées. Le prochain téléchargement contiendra ce classeur.');
      closeWorkbookEditor();
    } catch (err) {
      console.error('Workbook save:', err);
      const msg = err.response?.data?.detail || err.message || 'Enregistrement impossible.';
      setWorkbookEditor((w) => ({
        ...w,
        saving: false,
        error: typeof msg === 'string' ? msg : JSON.stringify(msg),
      }));
    }
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
    let cancelled = false;
    (async () => {
      try {
        const list = await projectService.getProjects();
        if (!cancelled) setProjects(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Projects load for Valuation IA:', e);
        if (!cancelled) setProjects([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isSuccess && result?.type === 'excel') {
      loadReportHistory();
    }
  }, [isSuccess, result?.type]);

  const autocadModalOpen = autocadDescription !== null || autocadDescriptionError != null;

  useEffect(() => {
    const anyModal = workbookEditor.open || autocadModalOpen || aiDiagnosticModal != null;
    if (!anyModal) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [workbookEditor.open, autocadModalOpen, aiDiagnosticModal]);

  const wbSheet = workbookEditor.open ? workbookEditor.sheets[workbookEditor.activeSheetIdx] : null;
  const wbRows = wbSheet?.rows || [];
  const wbStart = workbookEditor.rowPage * WB_ROWS_PER_PAGE;
  const wbSlice = wbRows.slice(wbStart, wbStart + WB_ROWS_PER_PAGE);
  const wbColCount = wbRows.reduce((m, r) => Math.max(m, Array.isArray(r) ? r.length : 0), 0);
  const wbMaxPage = Math.max(0, Math.ceil(wbRows.length / WB_ROWS_PER_PAGE) - 1);

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

      <div className="manus-content">
        <div className="manus-content-layout">
          <div className="manus-primary-column">
            <section className="manus-card manus-card--workflow" aria-labelledby="manus-workflow-heading">
              <header className="manus-card-head">
                <span className="manus-eyebrow">Nouvelle génération</span>
                <h2 id="manus-workflow-heading" className="manus-card-title">
                  Fichiers et options du rapport
                </h2>
                <p className="manus-card-subtitle">
                  Téléchargez vos pièces jointes, associez éventuellement un projet, puis lancez la génération Excel ou Word.
                </p>
              </header>

              <div className="manus-field-grid">
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

        <div className="manus-project-input">
          <label htmlFor="manus-db-project" className="manus-label">
            Projet en base de données (optionnel)
          </label>
          <select
            id="manus-db-project"
            className="manus-input manus-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">Aucun</option>
            {projects.map((p) => {
              const pid = projectRowId(p);
              return (
                <option key={String(pid)} value={String(pid)}>
                  {projectRowLabel(p)}
                </option>
              );
            })}
          </select>
          <p className="manus-db-project-hint">
            Sera associé au fichier dans l&apos;historique (en plus du nom libre ci-dessus).
          </p>
        </div>
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
            </section>
          </div>

          <aside className="manus-aside-column" aria-labelledby="manus-history-heading">
            <section className="manus-history-section manus-card manus-card--history">
          <div className="manus-history-header">
            <h2 id="manus-history-heading" className="manus-history-title">Historique des rapports Excel</h2>
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
            Les rapports sont enregistrés sur le serveur. Liez un rapport à un projet de la base, modifiez le classeur dans
            l’application, puis téléchargez la version à jour.
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportHistory.map((row) => (
                    <tr key={row.id}>
                      <td>{formatHistoryDate(row.created_at)}</td>
                      <td className="manus-history-project-cell">
                        <div className="manus-history-project-label">
                          {row.project_label_resolved || row.project_label || row.project_name || '—'}
                        </div>
                        <select
                          className="manus-history-project-select"
                          value={row.project_id != null ? String(row.project_id) : ''}
                          onChange={(e) => handleAssignHistoryProject(row.id, e.target.value)}
                          disabled={assigningReportId === row.id}
                          aria-label="Lier à un projet"
                        >
                          <option value="">Aucun projet</option>
                          {projects.map((p) => {
                            const pid = projectRowId(p);
                            return (
                              <option key={String(pid)} value={String(pid)}>
                                {projectRowLabel(p)}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td className="manus-history-sources" title={(row.source_files || []).join(', ')}>
                        {(row.source_files || []).length
                          ? `${(row.source_files || []).slice(0, 2).join(', ')}${
                              (row.source_files || []).length > 2 ? ` (+${(row.source_files || []).length - 2})` : ''
                            }`
                          : '—'}
                      </td>
                      <td>{formatFileSize(row.size_bytes || 0)}</td>
                      <td>
                        <div className="manus-history-actions">
                          <button
                            type="button"
                            className="manus-history-edit-btn"
                            onClick={() => openWorkbookEditor(row.id)}
                            disabled={
                              workbookEditor.loading &&
                              workbookEditor.open &&
                              workbookEditor.reportId === row.id
                            }
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            className="manus-history-diagnostic-btn"
                            onClick={() => openAiDiagnosticModal(row)}
                            title="Analyse intelligente du classeur (bientôt disponible)"
                          >
                            <SparklesIcon />
                            Diagnostic IA
                          </button>
                          <button
                            type="button"
                            className="manus-history-download-btn"
                            onClick={() => handleDownloadHistory(row.id)}
                            disabled={downloadingId === row.id}
                          >
                            <DownloadIcon />
                            {downloadingId === row.id ? '…' : 'Télécharger'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
            </section>
          </aside>
        </div>

        {/* Modal: workbook editor (portal = viewport; Layout main uses GSAP transform which breaks position:fixed) */}
        {workbookEditor.open &&
          createPortal(
            <div
              className="manus-modal-overlay manus-modal-overlay--portal manus-modal-overlay--wb"
              onClick={closeWorkbookEditor}
              role="dialog"
              aria-modal="true"
              aria-labelledby="manus-wb-modal-title"
            >
              <div className="manus-modal manus-wb-editor-modal" onClick={(e) => e.stopPropagation()}>
                <div className="manus-modal-header">
                  <h3 id="manus-wb-modal-title">Modifier le classeur Excel</h3>
                  <button type="button" className="manus-modal-close" onClick={closeWorkbookEditor} aria-label="Fermer">
                    <XIcon />
                  </button>
                </div>
                <div className="manus-modal-body manus-wb-editor-body">
                  {workbookEditor.loading && (
                    <p className="manus-wb-loading">Chargement du classeur…</p>
                  )}
                  {!workbookEditor.loading && workbookEditor.error && workbookEditor.sheets.length === 0 && (
                    <p className="manus-modal-error">{workbookEditor.error}</p>
                  )}
                  {!workbookEditor.loading && workbookEditor.sheets.length > 0 && (
                    <>
                      {workbookEditor.totalCells > 8000 && (
                        <p className="manus-wb-editor-warning">
                          {workbookEditor.totalCells} cellules — affichage par paquets de {WB_ROWS_PER_PAGE} lignes.
                          L&apos;enregistrement conserve toutes les lignes ({wbRows.length} sur cette feuille).
                        </p>
                      )}
                      <div className="manus-wb-toolbar">
                        <div className="manus-wb-tabs">
                          {workbookEditor.sheets.map((s, idx) => (
                            <button
                              key={`${s.name}-${idx}`}
                              type="button"
                              className={`manus-wb-tab ${idx === workbookEditor.activeSheetIdx ? 'active' : ''}`}
                              onClick={() =>
                                setWorkbookEditor((w) => ({ ...w, activeSheetIdx: idx, rowPage: 0 }))
                              }
                            >
                              {s.name || `Feuille ${idx + 1}`}
                            </button>
                          ))}
                        </div>
                        <div className="manus-wb-pager">
                          <button
                            type="button"
                            className="manus-wb-pager-btn"
                            onClick={() =>
                              setWorkbookEditor((w) => ({ ...w, rowPage: Math.max(0, w.rowPage - 1) }))
                            }
                            disabled={workbookEditor.rowPage <= 0}
                          >
                            Lignes précédentes
                          </button>
                          <span className="manus-wb-pager-info">
                            {wbStart + 1}–{Math.min(wbStart + WB_ROWS_PER_PAGE, wbRows.length)} / {wbRows.length}
                          </span>
                          <button
                            type="button"
                            className="manus-wb-pager-btn"
                            onClick={() =>
                              setWorkbookEditor((w) => ({
                                ...w,
                                rowPage: Math.min(wbMaxPage, w.rowPage + 1),
                              }))
                            }
                            disabled={workbookEditor.rowPage >= wbMaxPage}
                          >
                            Lignes suivantes
                          </button>
                        </div>
                      </div>
                      <div className="manus-wb-grid-wrap">
                        <table className="manus-wb-grid">
                          <thead>
                            <tr>
                              <th className="manus-wb-corner" />
                              {Array.from({ length: Math.max(wbColCount, 1) }, (_, c) => (
                                <th key={c} className="manus-wb-col-head">
                                  {colExcelLabel(c)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {wbSlice.map((row, i) => {
                              const ri = wbStart + i;
                              const cells = Array.isArray(row) ? row : [];
                              return (
                                <tr key={ri}>
                                  <td className="manus-wb-row-head">{ri + 1}</td>
                                  {Array.from({ length: Math.max(wbColCount, 1) }, (_, c) => (
                                    <td key={c} className="manus-wb-cell">
                                      <input
                                        type="text"
                                        value={cells[c] == null ? '' : String(cells[c])}
                                        onChange={(e) =>
                                          updateWorkbookCell(
                                            workbookEditor.activeSheetIdx,
                                            ri,
                                            c,
                                            e.target.value
                                          )
                                        }
                                        aria-label={`${colExcelLabel(c)}${ri + 1}`}
                                      />
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {workbookEditor.error && (
                        <p className="manus-modal-error manus-wb-save-error">{workbookEditor.error}</p>
                      )}
                      <div className="manus-wb-footer">
                        <button type="button" className="manus-wb-footer-secondary" onClick={closeWorkbookEditor}>
                          Fermer
                        </button>
                        <button
                          type="button"
                          className="manus-wb-footer-primary"
                          onClick={handleSaveWorkbook}
                          disabled={workbookEditor.saving}
                        >
                          {workbookEditor.saving ? 'Enregistrement…' : 'Enregistrer dans le fichier'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* Modal: AutoCAD description + 3D plan */}
        {autocadModalOpen &&
          createPortal(
            <div
              className="manus-modal-overlay manus-modal-overlay--portal"
              onClick={closeAutocadModal}
              role="dialog"
              aria-modal="true"
            >
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
            </div>,
            document.body
          )}

        {aiDiagnosticModal &&
          createPortal(
            <div
              className="manus-modal-overlay manus-modal-overlay--portal"
              onClick={closeAiDiagnosticModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="manus-ai-diagnostic-title"
            >
              <div className="manus-modal manus-ai-diagnostic-modal" onClick={(e) => e.stopPropagation()}>
                <div className="manus-modal-header">
                  <h3 id="manus-ai-diagnostic-title">Diagnostic IA du classeur</h3>
                  <button type="button" className="manus-modal-close" onClick={closeAiDiagnosticModal} aria-label="Fermer">
                    <XIcon />
                  </button>
                </div>
                <div className="manus-modal-body">
                  <p className="manus-ai-diagnostic-soon">Bientôt disponible</p>
                  <p className="manus-ai-diagnostic-file">
                    Fichier concerné : <strong>{aiDiagnosticModal.label}</strong>
                  </p>
                  <p className="manus-ai-diagnostic-intro">
                    Cette fonctionnalité analysera votre rapport Excel de valorisation à l&apos;aide de l&apos;intelligence
                    artificielle. Elle pourra notamment :
                  </p>
                  <ul className="manus-ai-diagnostic-list">
                    <li>identifier les colonnes et blocs de données importants pour votre analyse IFRS 13 ;</li>
                    <li>détecter les erreurs évidentes, les incohérences entre feuilles ou les formules problématiques ;</li>
                    <li>signaler les valeurs qui semblent atypiques, peu documentées ou nécessitant une vérification humaine ;</li>
                    <li>proposer une synthèse pour faciliter vos contrôles avant diffusion ou audit.</li>
                  </ul>
                  <p className="manus-ai-diagnostic-foot">
                    L&apos;analyse sera lancée depuis cette page dès que le service sera activé côté serveur.
                  </p>
                  <div className="manus-ai-diagnostic-actions">
                    <button type="button" className="manus-wb-footer-primary" onClick={closeAiDiagnosticModal}>
                      Compris
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
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
                <p>Recevez un rapport Excel complet avec tous les calculs IFRS 13 ; une copie est conservée dans l&apos;historique pour re-téléchargement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManusReport;
