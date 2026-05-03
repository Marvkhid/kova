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
  type ReactNode,
} from 'react';
import type { Toast } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { TOAST_DURATION_MS as DURATION } from '@/lib/types/data/constants';

// ── Context ───────────────────────────────────────────────

interface ToastContextValue {
  toasts:    Toast[];
  addToast:  (message: string, type?: Toast['type']) => void;
  removeToast:(id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: Toast['type'] = 'success') => {
      const id = generateId();
      setToasts(prev => [...prev, { id, message, type }]);
      // Auto-dismiss
      setTimeout(() => removeToast(id), DURATION);
    },
    [removeToast]
  );

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