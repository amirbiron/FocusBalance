import { Plus } from 'lucide-react';
import { useQuickLogStore } from '@/store/quickLogStore';

/**
 * כפתור FAB גלובלי לתיעוד מהיר.
 * תמיד נגיש, בולט אבל לא לוחץ — מתואם לסעיף 4.1.2 באפיון.
 */
export function QuickLogFab() {
  const open = useQuickLogStore((s) => s.open);

  return (
    <button
      type="button"
      onClick={open}
      aria-label="תיעוד מנה חדשה"
      className="fixed bottom-20 end-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-warm text-white shadow-soft-lg hover:bg-warm-600 active:scale-95 transition sm:bottom-24"
    >
      <Plus className="h-7 w-7" aria-hidden="true" />
    </button>
  );
}
