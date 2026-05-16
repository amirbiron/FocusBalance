import { create } from 'zustand';

/**
 * State לפתיחת/סגירת ה-Quick Log modal.
 * גלובלי כי ה-FAB וכרטיסי ה-CTA למיניהם משתמשים בו.
 */
interface QuickLogState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useQuickLogStore = create<QuickLogState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
