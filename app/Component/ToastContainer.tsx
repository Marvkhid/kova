'use client';
// ============================================================
// KOVA — ToastContainer
// Place once inside layout.tsx — renders all active toasts.
// ============================================================

import { useEffect, useState } from 'react';
import { useToast } from './ToastContext';
import type { Toast } from '@/lib/types';

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Trigger entrance animation on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Trigger exit animation before removal
  const handleRemove = () => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 320);
  };

  const iconMap: Record<NonNullable<Toast['type']>, string> = {
    success: '✓',
    info: 'ℹ',
    error: '✕',
  };

  const colorMap: Record<NonNullable<Toast['type']>, string> = {
    success: 'border-l-[#2A5C45]',
    info: 'border-l-[#3B2F6E]',
    error: 'border-l-[#C0392B]',
  };

  const type = toast.type ?? 'success';

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={handleRemove}
      style={{
        animation: leaving
          ? 'toastOut 0.32s var(--ease-out) forwards'
          : visible
          ? 'toastIn 0.36s var(--ease-out) forwards'
          : 'none',
        opacity: visible && !leaving ? 1 : 0,
      }}
      className={[
        'flex items-start gap-3',
        'w-[calc(100vw-2rem)] sm:w-full sm:max-w-[360px]',
        'bg-[#0D0D0D] text-[#F5F0E8]',
        'rounded-[12px] sm:rounded-[14px] px-3.5 sm:px-4 py-3.5 sm:py-[14px]',
        'border-l-4',
        'shadow-[0_16px_40px_rgba(0,0,0,0.28)]',
        'cursor-pointer select-none',
        colorMap[type],
      ].join(' ')}
    >
      {/* Icon */}
      <span
        className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[0.7rem] sm:text-xs font-bold ${
          type === 'success'
            ? 'bg-[#2A5C45] text-white'
            : type === 'error'
            ? 'bg-[#C0392B] text-white'
            : 'bg-[#3B2F6E] text-white'
        }`}
      >
        {iconMap[type]}
      </span>

      {/* Message */}
      <p className="text-[0.84rem] sm:text-sm font-medium leading-snug flex-1 pt-[1px] sm:pt-[2px]">
        {toast.message}
      </p>

      {/* Dismiss */}
      <button
        type="button"
        aria-label="Dismiss notification"
        className="text-white/30 hover:text-white/70 text-lg leading-none mt-[-2px] flex-shrink-0 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          handleRemove();
        }}
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      aria-label="Notifications"
      className="fixed z-[200] pointer-events-none
                 left-1/2 -translate-x-1/2 bottom-4
                 sm:left-auto sm:right-6 sm:translate-x-0 sm:bottom-6
                 flex flex-col gap-2.5 sm:gap-3 items-center sm:items-end
                 pb-[max(0px,env(safe-area-inset-bottom))]"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}