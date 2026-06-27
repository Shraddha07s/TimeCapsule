import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-50 space-y-3.5 max-w-sm w-full no-print pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let bgColor = 'bg-slate-900/95';
            let borderColor = 'border-white/10';
            let iconColor = 'text-blue-400';
            let Icon = Info;

            if (toast.type === 'success') {
              bgColor = 'bg-emerald-950/95';
              borderColor = 'border-emerald-500/20';
              iconColor = 'text-emerald-400';
              Icon = CheckCircle2;
            } else if (toast.type === 'error') {
              bgColor = 'bg-rose-950/95';
              borderColor = 'border-rose-500/20';
              iconColor = 'text-rose-400';
              Icon = AlertTriangle;
            } else if (toast.type === 'warning') {
              bgColor = 'bg-amber-950/95';
              borderColor = 'border-amber-500/20';
              iconColor = 'text-amber-400';
              Icon = AlertTriangle;
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`pointer-events-auto p-4 rounded-2xl border ${borderColor} ${bgColor} shadow-2xl flex items-start gap-3 backdrop-blur-md`}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
                <div className="flex-1 text-left text-xs font-semibold text-white/90 leading-snug">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
