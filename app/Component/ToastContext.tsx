'use client';
// ============================================================
// KOVA — Toast / Notification System
// Global context. Wrap app in <ToastProvider>.
// Call useToast().addToast(message) from anywhere.
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import type { Toast } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { TOAST_DURATION_MS as DURATION } from '@/lib/types/data/constants';

// ── Context ───────────────────────────────────────────────

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────

const MAX_TOASTS = 4; // optional safety cap

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));

    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message: string, type: Toast['type'] = 'success') => {
      const id = generateId();

      setToasts((prev) => {
        const next = [...prev, { id, message, type }];
        return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
      });

      const timer = setTimeout(() => {
        removeToast(id);
      }, DURATION);

      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}