import { db } from './database';
import type { Trigger } from './schema';

/**
 * טריגרים ברירת-מחדל — מתוך טבלת הקטגוריות בסעיף 4.2 של האפיון.
 * נטענים פעם אחת בהתקנה ראשונה.
 */
const SYSTEM_TRIGGERS: Omit<Trigger, 'id'>[] = [
  // 🎯 משימה
  { category: 'task', label: 'דדליין', icon: '⏰', isSystem: true },
  { category: 'task', label: 'באג מסובך', icon: '🐞', isSystem: true },
  { category: 'task', label: 'code review', icon: '🔍', isSystem: true },
  { category: 'task', label: 'ישיבה', icon: '👥', isSystem: true },

  // 🧠 קוגניטיבי
  { category: 'cognitive', label: 'קושי בריכוז', icon: '🌫️', isSystem: true },
  { category: 'cognitive', label: 'ערפול', icon: '☁️', isSystem: true },
  { category: 'cognitive', label: 'רוצה flow', icon: '🌊', isSystem: true },

  // 😴 פיזי
  { category: 'physical', label: 'עייפות', icon: '😴', isSystem: true },
  { category: 'physical', label: 'חוסר שינה', icon: '🛏️', isSystem: true },
  { category: 'physical', label: 'אחרי ארוחה', icon: '🍽️', isSystem: true },

  // 😰 רגשי
  { category: 'emotional', label: 'חרדה', icon: '💭', isSystem: true },
  { category: 'emotional', label: 'שעמום', icon: '🥱', isSystem: true },
  { category: 'emotional', label: 'דחיינות', icon: '🌀', isSystem: true },

  // 🔄 הרגל
  { category: 'habit', label: 'פשוט הזמן', icon: '🔁', isSystem: true },
];

/**
 * מבצע seed פעם אחת — רק אם הטבלה ריקה.
 * משתמש בטרנזקציה כדי למנוע race condition בין כפילי קריאה.
 * (לפי כלל 2 ב-CLAUDE.md — check-then-act אטומי)
 */
export async function seedIfNeeded(): Promise<void> {
  await db.transaction('rw', db.triggers, async () => {
    const count = await db.triggers.count();
    if (count === 0) {
      await db.triggers.bulkAdd(SYSTEM_TRIGGERS as Trigger[]);
    }
  });
}
