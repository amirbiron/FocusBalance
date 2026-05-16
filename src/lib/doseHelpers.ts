import type { DoseEvent, User } from '@/db/schema';

/**
 * מסכם את סה"כ המ"ג בטווח של אירועי מנה.
 * הגנה על NaN: אם איכשהו נכנס NaN (נתון פגום מהדפדפן) — מתעלמים.
 */
export function sumAmountMg(events: DoseEvent[]): number {
  return events.reduce((acc, e) => {
    if (Number.isNaN(e.amountMg) || !Number.isFinite(e.amountMg)) return acc;
    return acc + e.amountMg;
  }, 0);
}

/** האם המנה החדשה תוביל לחריגה מהיעד היומי? */
export function wouldExceedDailyTarget(
  user: User,
  todayEvents: DoseEvent[],
  newAmountMg: number
): boolean {
  const target = user.prescribedDailyDose;
  const current = sumAmountMg(todayEvents);
  return current + newAmountMg > target;
}

/**
 * מסווג מנה כ"מתוכננת" אם השעה שלה קרובה (±60 דק') לשעה
 * מתוכננת בפרופיל. בגרסה זו זו חלוקה גסה — מספיק טוב ל-MVP.
 */
export function isPlannedDose(timestampIso: string, scheduledTimes: string[]): boolean {
  if (scheduledTimes.length === 0) return false;
  const ts = new Date(timestampIso);
  const minutes = ts.getHours() * 60 + ts.getMinutes();
  const TOLERANCE_MIN = 60;
  for (const s of scheduledTimes) {
    const [hStr, mStr] = s.split(':');
    const h = Number(hStr);
    const m = Number(mStr);
    if (Number.isNaN(h) || Number.isNaN(m)) continue;
    const scheduled = h * 60 + m;
    if (Math.abs(minutes - scheduled) <= TOLERANCE_MIN) return true;
  }
  return false;
}

/** "HH:MM" של עכשיו, להזנה ל-time picker */
export function nowAsTimeString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ממיר HH:MM של היום לתאריך ISO מלא */
export function todayTimeToIso(timeHHMM: string): string {
  const [hStr, mStr] = timeHHMM.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) {
    throw new Error('שעה לא תקינה');
  }
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}
