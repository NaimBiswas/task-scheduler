'use client';

import { FC, createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
  duration?: number;
}

interface ToasterContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToasterContext = createContext<ToasterContextType | undefined>(undefined);

export const ToasterProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 3000 };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, newToast.duration);
  };

  return (
    <ToasterContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`bg-${
              toast.type === 'success' ? 'green' : 'red'
            }-500/80 backdrop-blur-md text-white p-4 rounded-lg shadow-lg transform transition-all duration-300 animate-slide-in`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
};

export const useToaster = () => {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error('useToaster must be used within a ToasterProvider');
  }
  return context;
};