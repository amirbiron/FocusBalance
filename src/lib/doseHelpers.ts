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
    // הפרש מעגלי על מחוג 24 שעות — 23:50 ו-00:10 צריכים להיחשב קרובים
    const raw = Math.abs(minutes - scheduled);
    const delta = Math.min(raw, 1440 - raw);
    if (delta <= TOLERANCE_MIN) return true;
  }
  return false;
}

/** "HH:MM" של עכשיו, להזנה ל-time picker */
export function nowAsTimeString(): string {
  return formatTimeHHMM(new Date());
}

/**
 * "HH:MM" של תאריך נתון לפי השעון המקומי, להזנה ל-input[type=time].
 * אסור להשתמש ב-toLocaleTimeString('he-IL', ...) כי הוא עלול להחזיר
 * סימני כיוון נסתרים (RLM/LRM) שיגרמו לקלט להופיע ריק ול-Number()
 * להחזיר NaN בעת הניתוח.
 */
export function formatTimeHHMM(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * ממיר HH:MM של היום לתאריך ISO מלא.
 * חובה לאמת טווחים — אחרת setHours יבלע ערכים פסולים (למשל 25:99)
 * ויחזור עם תאריך משונה בלי לזרוק שגיאה.
 */
export function todayTimeToIso(timeHHMM: string): string {
  const parts = timeHHMM.split(':');
  if (parts.length !== 2) throw new Error('שעה לא תקינה');
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isInteger(h) || !Number.isInteger(m)) {
    throw new Error('שעה לא תקינה');
  }
  if (h < 0 || h > 23 || m < 0 || m > 59) {
    throw new Error('שעה לא תקינה');
  }
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

/** מצב יומי לפי היחס לסכום היעד — בלי אדום (כלל מסעיף 2 באפיון) */
export type DayStatus = 'in-target' | 'slightly-over' | 'over' | 'empty';

export function classifyDayStatus(totalMg: number, targetMg: number): DayStatus {
  if (totalMg === 0) return 'empty';
  if (totalMg <= targetMg) return 'in-target';
  // קטן מ-25% מעל יעד = "מעט מעל", אחרת "מעל" (כתום, לא אדום)
  const overRatio = (totalMg - targetMg) / targetMg;
  return overRatio <= 0.25 ? 'slightly-over' : 'over';
}

/**
 * צבעי מצב — לפי האפיון (סעיף 6): ירוק/צהוב/כתום, בלי אדום.
 * החזרת קלאסים של Tailwind להחלת על Badge.
 */
export interface StatusColors {
  bg: string;
  text: string;
  label: string;
}
export function statusColors(status: DayStatus): StatusColors {
  switch (status) {
    case 'in-target':
      return { bg: 'bg-accent-50', text: 'text-accent-700', label: 'ביעד' };
    case 'slightly-over':
      return { bg: 'bg-warning-50', text: 'text-warning-600', label: 'מעט מעל' };
    case 'over':
      return { bg: 'bg-warm-50', text: 'text-warm-600', label: 'מעל היעד' };
    case 'empty':
      return { bg: 'bg-brand-50', text: 'text-slate-500', label: 'אין נטילות' };
  }
}

/** תאריך ב-YYYY-MM-DD לפי השעון המקומי */
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * מקבץ אירועי מנה לפי יום (לפי השעון המקומי).
 * מחזיר Map מ-YYYY-MM-DD לסכום מ"ג ביום.
 */
export function aggregateByDay(events: DoseEvent[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of events) {
    if (Number.isNaN(e.amountMg) || !Number.isFinite(e.amountMg)) continue;
    const key = localDateKey(new Date(e.timestamp));
    map.set(key, (map.get(key) ?? 0) + e.amountMg);
  }
  return map;
}

/**
 * חישוב Streak — כמה ימים רצופים אחורנית המשתמש היה ביעד,
 * החל מהיום או מאתמול (אם אין נטילות היום, לא קוטע את הרצף).
 *
 * הערה: יום ללא נטילות *לפני* היום כן מפסיק את הרצף — כי זה מעיד
 * על חוסר תיעוד, לא על "ביעד".
 */
export function calculateStreak(
  byDay: Map<string, number>,
  targetMg: number,
  today: Date = new Date()
): number {
  let streak = 0;
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);

  // אם היום ריק, לא מאפסים — מתחילים מאתמול
  const todayKey = localDateKey(cursor);
  const todayTotal = byDay.get(todayKey) ?? 0;
  if (todayTotal === 0) {
    cursor.setDate(cursor.getDate() - 1);
  }

  // הולכים אחורה כל עוד היום ביעד (לא ריק ולא מעל)
  while (streak < 365) {
    const key = localDateKey(cursor);
    const total = byDay.get(key) ?? 0;
    if (total === 0 || total > targetMg) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * מחזיר נתונים שבועיים — מערך של 7 ימים מ-6 ימים אחורה ועד היום.
 */
export interface DayBar {
  dateKey: string;
  label: string;
  totalMg: number;
}
export function buildWeeklySeries(
  byDay: Map<string, number>,
  today: Date = new Date()
): DayBar[] {
  const days: DayBar[] = [];
  // קיצורים ימים בעברית — start from Sunday=0
  const WEEKDAY_HE = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = localDateKey(d);
    days.push({
      dateKey: key,
      label: WEEKDAY_HE[d.getDay()] ?? '?',
      totalMg: byDay.get(key) ?? 0,
    });
  }
  return days;
}
