import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { Toast as ToastType } from '../../hooks/useToast';
import { clsx } from 'clsx';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
};

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const Icon = iconMap[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={clsx(
        'fixed top-4 right-4 z-[9999] min-w-80 rounded-xl shadow-lg text-white px-6 py-4 flex items-center gap-3 animate-in slide-in-from-right-full',
        colorMap[toast.type]
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.description && (
          <p className="text-sm opacity-90 mt-1">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};