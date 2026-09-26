'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // toast('Đã lưu') / toast('Lỗi', 'error'), or pass an action result directly:
  // toast(result, 'Đã lưu') shows result.error if present, otherwise the message.
  const toast = useCallback((msg, kind = 'success') => {
    let text = msg;
    let type = kind;
    if (msg && typeof msg === 'object') {
      if (msg.error) { text = msg.error; type = 'error'; }
      else { text = kind; type = 'success'; }
    }
    const id = Math.random();
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), type === 'error' ? 6000 : 3000);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        {toasts.map((t) => (
          <div key={t.id} role={t.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex max-w-sm items-start gap-2 rounded-lg px-4 py-3 text-sm shadow-lg ${
              t.type === 'error' ? 'bg-red-700 text-white' : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
            }`}>
            {t.type === 'error'
              ? <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              : <CheckCircle2 size={16} className="mt-0.5 shrink-0" aria-hidden="true" />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
