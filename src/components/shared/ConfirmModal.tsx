'use client';
import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  details?: string[];
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ConfirmModal({
  isOpen,
  title,
  description,
  details,
  onConfirm,
  onCancel,
  confirmLabel = 'EXECUTE NOW',
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = 'confirm-modal-title';

  // Focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { onCancel(); return; }
      if (e.key !== 'Tab') return;
      const modal = modalRef.current;
      if (!modal) return;
      const focusable = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    },
    [isOpen, onCancel]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Move focus into modal on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusable = modalRef.current.querySelector<HTMLElement>(FOCUSABLE);
      focusable?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity"
      aria-hidden={!isOpen}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-[#1E293B] border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl transition-transform scale-100"
      >
        <h2 id={titleId} className="text-lg font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400 text-sm mb-4">{description}</p>
        {details && details.length > 0 && (
          <ul className="mb-4 space-y-1">
            {details.map((d, i) => (
              <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-3 justify-end mt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-sm font-bold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded text-sm font-bold text-black bg-amber-500 hover:bg-amber-400 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
