import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 * Modal/Sheet בסיסי, נגיש.
 * - סוגר ב-Escape
 * - נועל גלילה ברקע כשפתוח
 * - מעביר פוקוס פנימה בפתיחה, ומחזיר לכפתור הקודם בסגירה
 * - במובייל: bottom sheet; במסכים רחבים: ממורכז
 */
export function Modal({ isOpen, onClose, title, children }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // שמירת האלמנט שהיה ב-focus לפני פתיחה, והעברת פוקוס לתוך הדיאלוג
    const prevFocused = document.activeElement as HTMLElement | null;
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
      // החזרת פוקוס לטריגר שפתח את המודאל (אם עוד קיים ב-DOM)
      prevFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="סגור"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
      />

      {/* תוכן */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-soft-lg border border-brand-100/60 animate-in slide-in-from-bottom-4"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-brand-100/60 bg-white/95 backdrop-blur px-5 py-3">
          <h2 id="modal-title" className="font-semibold text-brand-700">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור"
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-slate-400 hover:bg-brand-50 hover:text-brand-700"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
