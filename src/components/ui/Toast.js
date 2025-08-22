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
    // Trigger enter animation
    const enterTimer = setTimeout(() => setIsVisible(true), 50);
    
    // Auto remove after duration
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

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-400/30';
      case 'error':
        return 'border-red-400/30';
      case 'warning':
        return 'border-yellow-400/30';
      default:
        return 'border-blue-400/30';
    }
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-4 mb-3 bg-gray-900/90 backdrop-blur-sm border rounded-lg
        shadow-lg transition-all duration-200 ease-out
        ${getBorderColor()}
        ${isVisible && !isLeaving ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-full'}
        ${isLeaving ? 'translate-x-full' : ''}
      `}
    >
      {getIcon()}
      <div className="flex-1">
        {toast.title && (
          <div className="font-medium text-white text-sm mb-1">{toast.title}</div>
        )}
        <div className="text-gray-300 text-sm">{toast.message}</div>
      </div>
      <button
        onClick={handleClose}
        className="text-gray-400 hover:text-white transition-colors p-1"
      >
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

  const showSuccess = (message, title) => {
    addToast({ type: 'success', message, title });
  };

  const showError = (message, title) => {
    addToast({ type: 'error', message, title });
  };

  const showWarning = (message, title) => {
    addToast({ type: 'warning', message, title });
  };

  const showInfo = (message, title) => {
    addToast({ type: 'info', message, title });
  };

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};