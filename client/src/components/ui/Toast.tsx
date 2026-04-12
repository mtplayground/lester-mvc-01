import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  durationMs?: number;
}

interface ToastItem extends Required<Omit<ToastOptions, 'durationMs'>> {
  id: string;
  durationMs: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => undefined
});

function toastTypeStyles(type: ToastType): string {
  if (type === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-900';
  }

  if (type === 'error') {
    return 'border-rose-200 bg-rose-50 text-rose-900';
  }

  return 'border-sky-200 bg-sky-50 text-sky-900';
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const nextToast: ToastItem = {
        id,
        type: options.type ?? 'info',
        title: options.title,
        description: options.description ?? '',
        durationMs: options.durationMs ?? 3500
      };

      setToasts((previous) => [...previous, nextToast]);

      window.setTimeout(() => {
        removeToast(id);
      }, nextToast.durationMs);
    },
    [removeToast]
  );

  const contextValue = useMemo(
    () => ({
      showToast
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <section
            className={`pointer-events-auto rounded-md border px-3 py-2 shadow-md ${toastTypeStyles(toast.type)}`}
            key={toast.id}
            role="status"
          >
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.description ? <p className="mt-0.5 text-xs">{toast.description}</p> : null}
          </section>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
