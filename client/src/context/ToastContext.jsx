import { createContext, useCallback, useContext, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = 'info') => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(({ id, message, type }) => {
          const Icon = icons[type];
          return (
            <div
              key={id}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${colors[type]}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{message}</p>
              <button
                type="button"
                onClick={() => removeToast(id)}
                className="ml-2 opacity-60 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
