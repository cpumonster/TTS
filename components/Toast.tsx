import React, { useEffect } from 'react';
import { IconCheck, IconError, IconInfo } from './Icons';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <IconCheck className="w-5 h-5" />;
      case 'error':
        return <IconError className="w-5 h-5" />;
      case 'info':
      case 'warning':
        return <IconInfo className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-600 border-green-500';
      case 'error':
        return 'bg-red-600 border-red-500';
      case 'info':
        return 'bg-blue-600 border-blue-500';
      case 'warning':
        return 'bg-yellow-600 border-yellow-500';
    }
  };

  return (
    <div
      className={`${getColors()} border-l-4 p-4 rounded-lg shadow-lg flex items-start space-x-3 min-w-[300px] max-w-md animate-slide-in`}
      role="alert"
    >
      <div className="flex-shrink-0 text-white mt-0.5">{getIcon()}</div>
      <div className="flex-grow">
        <p className="text-sm font-medium text-white">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

