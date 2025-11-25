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
          <div key={t.id} className={`toast ${t.type}`} onClick={() => removeToast(t.id)}>
            <div className="toast-message">{t.message}</div>
            <button className="toast-close">✕</button>
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
