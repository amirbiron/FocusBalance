import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Lightbulb, TrendingUp } from 'lucide-react';
import { getRecentDays } from '@/db/repositories/doses';
import { listTriggers } from '@/db/repositories/triggers';
import type { Trigger, TriggerCategory } from '@/db/schema';

/**
 * המלצה בסיסית פר קטגוריית טריגר (מבוסס על דוגמת ה-MVP בסעיף 4.3 באפיון).
 * נטענת בלוקאלי — בלי קריאות חיצוניות.
 */
const RECOMMENDATIONS: Record<TriggerCategory, string> = {
  task: 'דדליין או משימה מאתגרת? נסה לחלק את העבודה לבלוקים של 25 דק׳ (Pomodoro) — לעיתים זה מספיק בלי מנה נוספת.',
  cognitive:
    'קושי בריכוז יכול להיגרם גם משתייה לא מספקת או רעב — נסה כוס מים והפסקה קצרה לפני מנה נוספת.',
  physical:
    'עייפות קשורה לרוב לאיכות שינה. שיפור הרגלי השינה משפיע פעמים רבות יותר מהמינון.',
  emotional:
    'חרדה/שעמום אינם תמיד בקשה לפוקוס. תרגול נשימה של 2 דק׳, או הליכה קצרה, יכולים להפחית את הצורך.',
  habit:
    'הרגל הוא הטריגר הכי שקט. שאל את עצמך: "האם אני באמת צריך עכשיו, או שזו שעת המנה הרגילה?"',
  other: 'נסה לפרט במחשבה את הסיבה — לפעמים זיהוי מדויק מצמצם את הצורך.',
};

const CATEGORY_LABELS: Record<TriggerCategory, string> = {
  task: 'משימה',
  cognitive: 'קוגניטיבי',
  physical: 'פיזי',
  emotional: 'רגשי',
  habit: 'הרגל',
  other: 'אחר',
};

interface TriggerStat {
  trigger: Trigger;
  count: number;
}

export function TriggersTab() {
  const events = useLiveQuery(() => getRecentDays(30), [], []);
  const triggers = useLiveQuery(() => listTriggers(), [], []);

  const triggersById = useMemo(() => {
    const m = new Map<number, Trigger>();
    for (const t of triggers ?? []) {
      if (t.id !== undefined) m.set(t.id, t);
    }
    return m;
  }, [triggers]);

  // ספירת שכיחות פר טריגר
  const stats = useMemo<TriggerStat[]>(() => {
    const counts = new Map<number, number>();
    let totalTriggered = 0;
    for (const e of events) {
      for (const tid of e.triggerIds) {
        counts.set(tid, (counts.get(tid) ?? 0) + 1);
        totalTriggered++;
      }
    }
    void totalTriggered;
    const out: TriggerStat[] = [];
    for (const [tid, count] of counts.entries()) {
      const trigger = triggersById.get(tid);
      if (trigger) out.push({ trigger, count });
    }
    return out.sort((a, b) => b.count - a.count);
  }, [events, triggersById]);

  const totalSelections = stats.reduce((acc, s) => acc + s.count, 0);
  const top = stats[0];

  if (totalSelections === 0) {
    return (
      <div className="space-y-4">
        <div className="card text-center py-8 space-y-2">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 mb-2">
            <Lightbulb className="h-6 w-6" aria-hidden="true" />
          </span>
          <h3 className="font-bold text-brand-700">עוד לא מספיק נתונים</h3>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            תיעוד טריגרים יעזור לנו לזהות דפוסים. ב-Quick Log, בחר טריגר אחד או יותר
            בשלב "מה הוביל לזה?" כדי להתחיל לראות תובנות.
          </p>
        </div>
      </div>
    );
  }

  // נתונים לגרף — מוגבל ל-8 הראשונים כדי לא להעמיס במסך
  const chartData = stats.slice(0, 8).map((s) => ({
    label: s.trigger.label,
    icon: s.trigger.icon,
    count: s.count,
  }));

  // קטגוריות עיקריות (עד 3 ראשונות) להמלצות
  const topCategoriesByCount = new Map<TriggerCategory, number>();
  for (const s of stats) {
    topCategoriesByCount.set(
      s.trigger.category,
      (topCategoriesByCount.get(s.trigger.category) ?? 0) + s.count
    );
  }
  const topCategories = Array.from(topCategoriesByCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* סיכום מילולי */}
      <div className="card space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="font-bold text-brand-700">סיכום 30 הימים האחרונים</h2>
        </div>
        {top && (
          <p className="text-sm text-slate-700 leading-relaxed">
            הטריגר המוביל שלך הוא{' '}
            <strong className="text-brand-700">
              {top.trigger.icon} {top.trigger.label}
            </strong>
            {' — '}
            <span dir="ltr">
              {Math.round((top.count / totalSelections) * 100)}%
            </span>{' '}
            מבחירות הטריגר ({top.count} פעמים).
          </p>
        )}
      </div>

      {/* גרף שכיחות */}
      <div className="card">
        <h3 className="mb-3 font-bold text-brand-700">שכיחות טריגרים</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                stroke="#94A3B8"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                orientation="top"
              />
              <YAxis
                type="category"
                dataKey="label"
                stroke="#475569"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={92}
                orientation="right"
              />
              <Tooltip
                cursor={{ fill: 'rgba(107, 70, 193, 0.06)' }}
                contentStyle={{
                  background: 'white',
                  border: '1px solid #E8E0F5',
                  borderRadius: 12,
                  fontSize: 12,
                  direction: 'rtl',
                }}
                formatter={(value: number) => [`${value} פעמים`, 'שכיחות']}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={22}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#6B46C1' : '#9275CC'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* המלצות פר קטגוריה */}
      <div className="card space-y-3">
        <h3 className="font-bold text-brand-700">המלצות בשבילך</h3>
        <p className="text-xs text-slate-500">
          הצעות לחשיבה, לא תחליף לייעוץ. המלצות שמשנות מינון — תמיד דרך הרופא.
        </p>
        <ul className="space-y-3">
          {topCategories.map(([cat, count]) => (
            <li
              key={cat}
              className="rounded-2xl bg-brand-50/50 p-3 border border-brand-100"
            >
              <p className="mb-1 text-xs font-semibold text-brand-700">
                קטגוריית {CATEGORY_LABELS[cat]} · {count} פעמים
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {RECOMMENDATIONS[cat]}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
