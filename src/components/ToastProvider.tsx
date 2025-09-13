import React from 'react';
import { useToast } from '../contexts/ToastContext';
import { Toast } from './ui/Toast';

export const ToastRenderer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100001] space-y-2">
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ transform: `translateY(${index * 10}px)` }}>
          <Toast
            toast={toast}
            onRemove={removeToast}
          />
        </div>
      ))}
    </div>
  );
};