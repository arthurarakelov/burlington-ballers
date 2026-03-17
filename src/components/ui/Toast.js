import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const enterTimer = setTimeout(() => setIsVisible(true), 50);
    const removeTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onRemove(toast.id), 200);
    }, toast.duration || 4000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-rose-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    info: <AlertCircle className="w-5 h-5 text-blue-400" />,
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-4 mb-2 rounded-2xl
        bg-[#1c1c1e]/95 backdrop-blur-xl shadow-lg shadow-black/30
        transition-all duration-200 ease-out
        ${isVisible && !isLeaving ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      {icons[toast.type] || icons.info}
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-medium text-white text-sm">{toast.title}</p>}
        <p className="text-white/60 text-sm">{toast.message}</p>
      </div>
      <button onClick={handleClose} className="text-white/30 hover:text-white/60 transition-colors p-1 min-w-[28px] min-h-[28px] flex items-center justify-center">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, title) => addToast({ type: 'success', message, title });
  const showError = (message, title) => addToast({ type: 'error', message, title });
  const showWarning = (message, title) => addToast({ type: 'warning', message, title });
  const showInfo = (message, title) => addToast({ type: 'info', message, title });

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      <div className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
