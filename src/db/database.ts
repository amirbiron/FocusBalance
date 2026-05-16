import Dexie, { type EntityTable } from 'dexie';
import type { DoseEvent, ReductionPlan, Trigger, User } from './schema';

/**
 * מסד הנתונים המקומי של FocusBalance.
 * מבוסס על Dexie (wrapper ל-IndexedDB) — הכל בדפדפן, ללא שליחה לשרת.
 *
 * מימוש עיקרון הפרטיות מהאפיון (סעיף 8):
 * כל הנתונים מקומיים. אין endpoint חיצוני.
 */
class FocusBalanceDB extends Dexie {
  users!: EntityTable<User, 'id'>;
  doseEvents!: EntityTable<DoseEvent, 'id'>;
  triggers!: EntityTable<Trigger, 'id'>;
  reductionPlans!: EntityTable<ReductionPlan, 'id'>;

  constructor() {
    super('FocusBalanceDB');

    this.version(1).stores({
      // אינדקסים: שדה ראשי + שדות לסינון
      users: '++id, hasAcceptedDisclaimer',
      doseEvents: '++id, userId, timestamp, isPlanned, [userId+timestamp]',
      triggers: '++id, category, isSystem',
      reductionPlans: '++id, userId, startDate, targetDate',
    });
  }
}

export const db = new FocusBalanceDB();

/** מזהה המשתמש היחיד ב-MVP (משתמש מקומי) */
export const LOCAL_USER_ID = 1;
