import { db, LOCAL_USER_ID } from '../database';
import type { User } from '../schema';
import { isValidPositiveNumber } from '@/lib/utils';

/** מחזיר את המשתמש המקומי או undefined אם עוד לא בוצע אונבורדינג */
export async function getLocalUser(): Promise<User | undefined> {
  return db.users.get(LOCAL_USER_ID);
}

/**
 * יוצר או מעדכן את המשתמש המקומי.
 * ולידציה לפי כלל 4 ב-CLAUDE.md — בדיקת NaN/Infinity.
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
