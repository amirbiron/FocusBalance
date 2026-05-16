import { db, LOCAL_USER_ID } from '../database';
import type { User } from '../schema';
import { isValidPositiveNumber } from '@/lib/utils';

/** מחזיר את המשתמש המקומי או undefined אם עוד לא בוצע אונבורדינג */
export async function getLocalUser(): Promise<User | undefined> {
  return db.users.get(LOCAL_USER_ID);
}

// פורמט שעה תקני 24 שעות, בדיוק "HH:MM"
const TIME_HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * יוצר או מעדכן את המשתמש המקומי.
 * ולידציה לפי כלל 4 ב-CLAUDE.md — בדיקת NaN/Infinity וטווחים.
 */
export async function upsertLocalUser(
  data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
): Promise<User> {
  // ולידציה — לא לסמוך על הקלט
  if (!isValidPositiveNumber(data.prescribedDailyDose, 500)) {
    throw new Error('מינון מרשם יומי אינו תקין');
  }
  for (const unit of data.unitDoses) {
    if (!isValidPositiveNumber(unit, 200)) {
      throw new Error('מינון יחידה אינו תקין');
    }
  }
  // ולידציה הגנתית של פורמט שעות — גם אם ה-UI מאמת, ה-repo לא סומך
  for (const t of data.scheduledTimes ?? []) {
    if (typeof t !== 'string' || !TIME_HHMM.test(t)) {
      throw new Error('שעה מתוכננת אינה בפורמט HH:MM');
    }
  }

  const now = new Date().toISOString();
  const existing = await db.users.get(LOCAL_USER_ID);

  const user: User = existing
    ? { ...existing, ...data, id: LOCAL_USER_ID, updatedAt: now }
    : { ...data, id: LOCAL_USER_ID, createdAt: now, updatedAt: now };

  await db.users.put(user);
  return user;
}

/** סימן ש-disclaimer אושר. נקרא בסיום האונבורדינג. */
export async function acceptDisclaimer(): Promise<void> {
  const user = await db.users.get(LOCAL_USER_ID);
  if (!user) return;
  await db.users.update(LOCAL_USER_ID, {
    hasAcceptedDisclaimer: true,
    updatedAt: new Date().toISOString(),
  });
  void user;
}
