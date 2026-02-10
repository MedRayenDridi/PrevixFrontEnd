import React, { createContext, useContext, useState, useCallback } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, { type = 'info', timeout = 4000 } = {}) => {
    const id = Math.random().toString(36).slice(2, 9);
    const newToast = { id, message, type };
    setToasts((t) => [...t, newToast]);
    if (timeout > 0) {
      setTimeout(() => {
        setToasts((t) => t.filter(x => x.id !== id));
      }, timeout);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter(x => x.id !== id));
  }, []);

  const api = {
    show: showToast,
    success: (msg, opts) => showToast(msg, { ...(opts || {}), type: 'success' }),
    error: (msg, opts) => showToast(msg, { ...(opts || {}), type: 'error' }),
    info: (msg, opts) => showToast(msg, { ...(opts || {}), type: 'info' }),
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div className="toast-root" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.type}`}
            onClick={() => removeToast(t.id)}
          >
            <div className="toast-icon-wrapper">
              <span className="toast-icon" aria-hidden="true">
                {t.type === 'success' && (
                  <svg viewBox="0 0 24 24">
                    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                  </svg>
                )}
                {t.type === 'error' && (
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2 2 22h20L12 2zm0 13.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-1-7h2v6h-2z" />
                  </svg>
                )}
                {t.type === 'info' && (
                  <svg viewBox="0 0 24 24">
                    <path d="M11 9h2V7h-2v2zm0 8h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  </svg>
                )}
              </span>
            </div>
            <div className="toast-content">
              <div className="toast-title">
                {t.type === 'success' && 'Succès'}
                {t.type === 'error' && 'Erreur'}
                {t.type === 'info' && 'Information'}
              </div>
              <div className="toast-message">{t.message}</div>
            </div>
            <button
              className="toast-close"
              type="button"
              aria-label="Fermer la notification"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(t.id);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

export default ToastProvider;
