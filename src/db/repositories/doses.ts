import { db, LOCAL_USER_ID } from '../database';
import type { DoseEvent } from '../schema';
import { isValidPositiveNumber } from '@/lib/utils';

/** מוסיף תיעוד מנה חדש. ולידציה מספרית לפי כלל 4. */
export async function addDoseEvent(
  data: Omit<DoseEvent, 'id' | 'userId' | 'createdAt'>
): Promise<number> {
  if (!isValidPositiveNumber(data.amountMg, 200)) {
    throw new Error('כמות מ"ג אינה תקינה');
  }
  // בדיקת timestamp תקין — לא NaN
  const ts = Date.parse(data.timestamp);
  if (Number.isNaN(ts)) {
    throw new Error('זמן הנטילה אינו תקין');
  }

  const event: DoseEvent = {
    ...data,
    userId: LOCAL_USER_ID,
    createdAt: new Date().toISOString(),
  };
  const id = await db.doseEvents.add(event);
  return id as number;
}

/** מחזיר את כל המנות בטווח תאריכים (ISO) — כולל גבולות */
export async function getDoseEventsInRange(
  fromIso: string,
  toIso: string
): Promise<DoseEvent[]> {
  return db.doseEvents
    .where('[userId+timestamp]')
    .between([LOCAL_USER_ID, fromIso], [LOCAL_USER_ID, toIso], true, true)
    .toArray();
}

/** מחזיר את כל המנות של היום (לוקאלי) */
export async function getTodayDoseEvents(): Promise<DoseEvent[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return getDoseEventsInRange(start.toISOString(), end.toISOString());
}

export async function deleteDoseEvent(id: number): Promise<void> {
  await db.doseEvents.delete(id);
}

export async function updateDoseEvent(
  id: number,
  patch: Partial<Omit<DoseEvent, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  if (patch.amountMg !== undefined && !isValidPositiveNumber(patch.amountMg, 200)) {
    throw new Error('כמות מ"ג אינה תקינה');
  }
  await db.doseEvents.update(id, patch);
}

/** מחזיר אירועים של N הימים האחרונים כולל היום (לפי שעון מקומי) */
export async function getRecentDays(days: number): Promise<DoseEvent[]> {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return getDoseEventsInRange(start.toISOString(), end.toISOString());
}
