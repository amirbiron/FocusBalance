import { useLiveQuery } from 'dexie-react-hooks';
import { Lightbulb } from 'lucide-react';
import { getRecentDays } from '@/db/repositories/doses';
import { aggregateByDay } from '@/lib/doseHelpers';
import type { User } from '@/db/schema';

interface Props {
  user: User;
}

const WEEKDAY_NAMES = [
  'ראשון',
  'שני',
  'שלישי',
  'רביעי',
  'חמישי',
  'שישי',
  'שבת',
];

/**
 * תובנת היום (סעיף 4.1.5 באפיון).
 * MVP: מזהה את יום השבוע השכיח של חריגות מהיעד ב-30 הימים האחרונים.
 * אם אין מספיק נתונים — מציג טקסט עידוד.
 */
export function InsightCard({ user }: Props) {
  const events = useLiveQuery(() => getRecentDays(30), [], []);
  const byDay = aggregateByDay(events);

  // ספירת חריגות לפי יום בשבוע (0=ראשון)
  const overByWeekday = new Array(7).fill(0) as number[];
  let totalOverDays = 0;
  let totalDaysWithData = 0;

  for (const [key, total] of byDay.entries()) {
    totalDaysWithData++;
    if (total > user.prescribedDailyDose) {
      totalOverDays++;
      // key הוא YYYY-MM-DD; new Date(key) פורש כ-UTC ויכול לזוז יום באזורי
      // זמן שליליים. בונים תאריך לוקאלי במפורש כדי שיום-בשבוע יתאים לתפיסה
      // של המשתמש.
      const [y, mo, da] = key.split('-').map(Number);
      const d = new Date(y ?? 1970, (mo ?? 1) - 1, da ?? 1);
      const dow = d.getDay();
      overByWeekday[dow] = (overByWeekday[dow] ?? 0) + 1;
    }
  }

  const insight = computeInsight(
    overByWeekday,
    totalOverDays,
    totalDaysWithData
  );

  return (
    <div className="card flex items-start gap-3 bg-gradient-to-br from-brand-50/60 to-accent-50/40">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm">
        <Lightbulb className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="flex-1">
        <p className="text-xs font-semibold text-brand-700 mb-1">תובנת היום</p>
        <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
      </div>
    </div>
  );
}

function computeInsight(
  overByWeekday: number[],
  totalOverDays: number,
  totalDaysWithData: number
): string {
  if (totalDaysWithData < 5) {
    return 'אנחנו עוד לומדים את הדפוסים שלך. ככל שתתעד יותר, התובנות יהפכו מדויקות יותר.';
  }
  if (totalOverDays === 0) {
    return 'מצוין — לא היו חריגות מהיעד בחודש האחרון. המשך כך 🌿';
  }

  // מציאת היום השכיח של חריגות
  let maxIdx = 0;
  let maxCount = 0;
  for (let i = 0; i < overByWeekday.length; i++) {
    const c = overByWeekday[i] ?? 0;
    if (c > maxCount) {
      maxCount = c;
      maxIdx = i;
    }
  }

  // צריך לפחות 2 פעמים כדי לקרוא לזה דפוס
  if (maxCount < 2) {
    return `היו ${totalOverDays} ימים מעל היעד בחודש האחרון. בקרוב נוכל לזהות איזה דפוס חוזר.`;
  }

  const dayName = WEEKDAY_NAMES[maxIdx];
  return `שמתי לב שהמנות הנוספות שלך מתרכזות בעיקר בימי ${dayName} (${maxCount} פעמים בחודש). יש משהו מיוחד ביום הזה?`;
}
