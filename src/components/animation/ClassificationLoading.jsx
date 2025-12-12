import { useState, useEffect, useRef } from 'react';
import { adminService } from '../../services/api';
import './ClassificationLoading.css';

const ClassificationLoading = ({ isVisible, onClose, projectId, fileId }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('processing');
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(true);
  const [summary, setSummary] = useState(null);
  const logsEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const isPollingRef = useRef(false);
  const hasFinishedRef = useRef(false);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  useEffect(() => {
    if (!isVisible || !projectId || !fileId) {
      setProgress(0);
      setStatus('processing');
      setLogs([]);
      setSummary(null);
      hasFinishedRef.current = false;
      isPollingRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }
    
    // Reset flags when component becomes visible
    hasFinishedRef.current = false;
    isPollingRef.current = false;

    const startTime = Date.now();
    
    // Simulate realistic progress
    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      let calculatedProgress = 0;
      
      if (elapsed < 10) {
        calculatedProgress = (elapsed / 10) * 30;
      } else if (elapsed < 40) {
        calculatedProgress = 30 + ((elapsed - 10) / 30) * 50;
      } else {
        const remainingTime = Math.min((elapsed - 40) / 20, 1);
        calculatedProgress = 80 + remainingTime * 15;
      }
      
      // Only update if still processing
      if (status === 'processing') {
        setProgress(Math.min(calculatedProgress, 95));
      }
    }, 100);

    // Poll classification status
    const pollStatus = async () => {
      // Don't poll if already finished or if another poll is in progress
      if (hasFinishedRef.current || isPollingRef.current) {
        return;
      }

      isPollingRef.current = true;
      
      try {
        const response = await adminService.getClassificationStatus(projectId, fileId);
        const { processing_status, metadata } = response;
        
        // Check if status changed to finished
        if (processing_status === 'completed' || processing_status === 'error') {
          hasFinishedRef.current = true;
          setStatus(processing_status);
          
          // Classification finished
          setProgress(100);
          clearInterval(progressInterval);
          
          if (metadata) {
            // Extract summary from metadata
            const summaryData = {
              tables_found: metadata.mapping_summary?.tables_found || 0,
              total_rows: metadata.mapping_summary?.total_rows || 0,
              detected_asset_type: metadata.detected_asset_type || metadata.mapping_summary?.detected_asset_type,
              complete_tables: metadata.mapping_summary?.complete_tables || 0,
              import_stats: metadata.import_stats,
              errors: metadata.errors || [],
              warnings: metadata.warnings || []
            };
            setSummary(summaryData);
            
            // Add final log entry
            if (processing_status === 'completed') {
              setLogs(prev => [...prev, {
                type: 'success',
                message: `Classification terminée avec succès! ${summaryData.import_stats?.success || 0} actifs importés.`,
                timestamp: new Date()
              }]);
            } else {
              setLogs(prev => [...prev, {
                type: 'error',
                message: `Erreur lors de la classification: ${metadata.errors?.[0] || 'Erreur inconnue'}`,
                timestamp: new Date()
              }]);
            }
          }
          
          // Stop polling immediately
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          isPollingRef.current = false;
          return; // Exit early, don't continue processing
        }
        
        // Update status if still processing
        setStatus(processing_status);
        
        // Still processing - add log entries based on progress
        const currentLogs = logs.length;
        const newLogs = [];
        
        if (currentLogs === 0) {
          newLogs.push({
            type: 'info',
            message: 'Démarrage de la classification...',
            timestamp: new Date()
          });
        }
        
        // Simulate progress logs based on status polling
        if (metadata) {
          const mappingSummary = metadata.mapping_summary;
          if (mappingSummary && mappingSummary.tables_found > 0 && !logs.some(l => l.message.includes('Tables trouvées'))) {
            newLogs.push({
              type: 'info',
              message: `${mappingSummary.tables_found} table(s) trouvée(s), ${mappingSummary.total_rows} ligne(s) au total`,
              timestamp: new Date()
            });
          }
          
          if (metadata.detected_asset_type && !logs.some(l => l.message.includes('Type d\'actif'))) {
            newLogs.push({
              type: 'info',
              message: `Type d'actif détecté: ${metadata.detected_asset_type}`,
              timestamp: new Date()
            });
          }
          
          if (mappingSummary && mappingSummary.complete_tables > 0 && !logs.some(l => l.message.includes('table(s) complète(s)'))) {
            newLogs.push({
              type: 'info',
              message: `${mappingSummary.complete_tables} table(s) complète(s) prête(s) pour l'import`,
              timestamp: new Date()
            });
          }
        }
        
        if (newLogs.length > 0) {
          setLogs(prev => [...prev, ...newLogs]);
        }
      } catch (error) {
        console.error('Error polling classification status:', error);
        setLogs(prev => [...prev, {
          type: 'error',
          message: `Erreur lors de la récupération du statut: ${error.message}`,
          timestamp: new Date()
        }]);
        
        // If we get repeated errors, mark as error status and stop polling
        if (status === 'processing' && !hasFinishedRef.current) {
          hasFinishedRef.current = true;
          setStatus('error');
          setProgress(100);
          setSummary({
            tables_found: 0,
            total_rows: 0,
            detected_asset_type: null,
            complete_tables: 0,
            import_stats: null,
            errors: [error.message],
            warnings: []
          });
          
          // Stop polling on error
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } finally {
        isPollingRef.current = false;
      }
    };

    // Initial poll
    pollStatus();
    
    // Poll every 3 seconds (reduced frequency to avoid spam)
    pollingIntervalRef.current = setInterval(() => {
      // Only poll if not finished
      if (!hasFinishedRef.current) {
        pollStatus();
      } else {
        // Clean up if finished
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isVisible, projectId, fileId, status, logs.length]);

  if (!isVisible) return null;

  return (
    <div className="classification-loading-overlay">
      <div className="classification-loading-container">
        {/* File and Classification Animation */}
        <div className="file-animation-container">
          <div className="file-icon file-icon-1">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          
          <div className="classification-badge">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div className="file-icon file-icon-2">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          
          {/* AI Processing Indicator */}
          <div className="ai-indicator">
            <div className="ai-pulse"></div>
            <div className="ai-core"></div>
          </div>
        </div>
        
        <div className="loading-content">
          <h2 className="loading-title">L'IA fait son travail</h2>
          <p className="loading-message">Veuillez patienter pendant que l'intelligence artificielle analyse et classe votre fichier...</p>
          
          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar-wrapper">
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="progress-percentage">{Math.round(progress)}%</div>
            </div>
          </div>

          {/* Toggle Logs Button */}
          <button 
            className="toggle-logs-btn"
            onClick={() => setShowLogs(!showLogs)}
          >
            {showLogs ? 'Masquer' : 'Afficher'} les logs
            <span className="toggle-icon">{showLogs ? '▼' : '▶'}</span>
          </button>

          {/* Logs Container */}
          {showLogs && (
            <div className="logs-container">
              <div className="logs-header">
                <span>Logs de progression</span>
              </div>
              <div className="logs-content">
                {logs.length === 0 ? (
                  <div className="log-entry log-info">
                    <span className="log-time">{new Date().toLocaleTimeString()}</span>
                    <span className="log-message">En attente de logs...</span>
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className={`log-entry log-${log.type}`}>
                      <span className="log-time">{log.timestamp.toLocaleTimeString()}</span>
                      <span className="log-message">{log.message}</span>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}

          {/* Summary */}
          {summary && (
            <div className="summary-container">
              <h3 className="summary-title">Résumé de la classification</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Tables trouvées:</span>
                  <span className="summary-value">{summary.tables_found}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Lignes totales:</span>
                  <span className="summary-value">{summary.total_rows}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Type d'actif:</span>
                  <span className="summary-value">{summary.detected_asset_type || 'N/A'}</span>
                </div>
                {summary.import_stats && (
                  <>
                    <div className="summary-item">
                      <span className="summary-label">Actifs importés:</span>
                      <span className="summary-value success">{summary.import_stats.success}/{summary.import_stats.total}</span>
                    </div>
                    {summary.import_stats.failed > 0 && (
                      <div className="summary-item">
                        <span className="summary-label">Échecs:</span>
                        <span className="summary-value error">{summary.import_stats.failed}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              {summary.errors && summary.errors.length > 0 && (
                <div className="summary-errors">
                  <strong>Erreurs:</strong>
                  <ul>
                    {summary.errors.slice(0, 5).map((error, idx) => (
                      <li key={idx}>{typeof error === 'string' ? error : error.error || JSON.stringify(error)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Close Button (always show when completed or error, or if user wants to cancel) */}
          <div className="close-button-container">
            {(status === 'completed' || status === 'error') ? (
              <button className="close-btn" onClick={onClose}>
                Fermer
              </button>
            ) : (
              <button className="close-btn cancel-btn" onClick={onClose}>
                Annuler et fermer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassificationLoading;
