import React, { createContext, useContext, useState, useCallback } from 'react';
import { manusService } from '../services/api';
import { useToast } from '../components/common/Toast';

const ReportGenerationContext = createContext(null);

const STATUS = {
  IDLE: 'idle',
  LOADING_EXCEL: 'loading_excel',
  LOADING_WORD: 'loading_word',
  SUCCESS_EXCEL: 'success_excel',
  SUCCESS_WORD: 'success_word',
  ERROR: 'error',
};

export function ReportGenerationProvider({ children }) {
  const toast = useToast();
  const [status, setStatus] = useState(STATUS.IDLE);
  const [result, setResult] = useState(null); // { type: 'excel'|'word', blob, filename }
  const [errorMessage, setErrorMessage] = useState(null);

  const clearReport = useCallback(() => {
    setStatus(STATUS.IDLE);
    setResult(null);
    setErrorMessage(null);
  }, []);

  const startExcelReport = useCallback(async (files, projectName) => {
    if (!files?.length) return;
    setStatus(STATUS.LOADING_EXCEL);
    setResult(null);
    setErrorMessage(null);
    try {
      const blob = await manusService.generateReport(files, projectName || null, null);
      const filename = `rapport_valuation_ia_${new Date().toISOString().split('T')[0]}.xlsx`;
      setResult({ type: 'excel', blob, filename });
      setStatus(STATUS.SUCCESS_EXCEL);
      toast.success('Rapport Excel prêt ! Retournez sur Valuation IA pour le télécharger.', { timeout: 8000 });
    } catch (err) {
      const msg = err.response?.data?.detail ?? err.message ?? 'Erreur lors de la génération.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setStatus(STATUS.ERROR);
      toast.error('Échec de la génération du rapport Excel. Consultez la page Valuation IA.');
    }
  }, [toast]);

  const startWordReport = useCallback(async (files, projectName) => {
    if (!files?.length) return;
    setStatus(STATUS.LOADING_WORD);
    setResult(null);
    setErrorMessage(null);
    try {
      const { blob, filename: resFilename } = await manusService.generatePdfReport(
        files,
        projectName || null,
        'IFRS',
        null,
        null
      );
      const filename = resFilename || `rapport_valuation_ia_${new Date().toISOString().split('T')[0]}.docx`;
      setResult({ type: 'word', blob, filename });
      setStatus(STATUS.SUCCESS_WORD);
      toast.success('Rapport Word prêt ! Retournez sur Valuation IA pour le télécharger.', { timeout: 8000 });
    } catch (err) {
      const msg = err.response?.data?.detail ?? err.message ?? 'Erreur lors de la génération.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setStatus(STATUS.ERROR);
      toast.error('Échec de la génération du rapport Word. Consultez la page Valuation IA.');
    }
  }, [toast]);

  const value = {
    status,
    result,
    errorMessage,
    isIdle: status === STATUS.IDLE,
    isLoading: status === STATUS.LOADING_EXCEL || status === STATUS.LOADING_WORD,
    isLoadingExcel: status === STATUS.LOADING_EXCEL,
    isLoadingWord: status === STATUS.LOADING_WORD,
    isSuccess: status === STATUS.SUCCESS_EXCEL || status === STATUS.SUCCESS_WORD,
    isError: status === STATUS.ERROR,
    startExcelReport,
    startWordReport,
    clearReport,
    STATUS,
  };

  return (
    <ReportGenerationContext.Provider value={value}>
      {children}
    </ReportGenerationContext.Provider>
  );
}

export function useReportGeneration() {
  const ctx = useContext(ReportGenerationContext);
  if (!ctx) throw new Error('useReportGeneration must be used inside ReportGenerationProvider');
  return ctx;
}
