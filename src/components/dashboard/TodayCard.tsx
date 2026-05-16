import { useLiveQuery } from 'dexie-react-hooks';
import { Sun } from 'lucide-react';
import { getTodayDoseEvents } from '@/db/repositories/doses';
import { classifyDayStatus, statusColors, sumAmountMg } from '@/lib/doseHelpers';
import type { User } from '@/db/schema';
import { cn } from '@/lib/utils';

interface Props {
  user: User;
}

/**
 * כרטיס "היום שלך" — סקירה ב-10 שניות (סעיף 4.1 באפיון).
 * - סכום מ"ג שנלקח / יעד
 * - מד התקדמות שמשתנה צבע לפי המצב (ירוק/צהוב/כתום — בלי אדום)
 * - שעת מנה אחרונה
 */
export function TodayCard({ user }: Props) {
  const events = useLiveQuery(() => getTodayDoseEvents(), [], []);

  const total = sumAmountMg(events);
  const status = classifyDayStatus(total, user.prescribedDailyDose);
  const colors = statusColors(status);

  // אחוז התקדמות — מוגבל ל-100% להצגה (גם אם מעבר ליעד)
  const percent = user.prescribedDailyDose > 0
    ? Math.min(100, Math.round((total / user.prescribedDailyDose) * 100))
    : 0;

  const lastEvent = events.length > 0
    ? [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]
    : null;

  const lastTime = lastEvent
    ? new Date(lastEvent.timestamp).toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  // צבע הבר משתנה לפי המצב
  const barColor =
    status === 'in-target'
      ? 'bg-accent'
      : status === 'slightly-over'
      ? 'bg-warning-500'
      : status === 'over'
      ? 'bg-warm'
      : 'bg-brand-200';

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Sun className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold text-brand-700">היום שלך</h2>
        </div>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', colors.bg, colors.text)}>
          {colors.label}
        </span>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-3xl font-bold text-brand-700">
            <span dir="ltr">{total}</span>
            <span className="text-base text-slate-500 font-normal">
              {' / '}
              <span dir="ltr">{user.prescribedDailyDose}</span> מ"ג
            </span>
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {events.length === 0
              ? 'עוד לא תועדה מנה היום'
              : `${events.length} מנות תועדו`}
          </p>
        </div>
        {lastTime && (
          <div className="text-end">
            <p className="text-xs text-slate-500">מנה אחרונה</p>
            <p className="text-lg font-semibold text-brand-700" dir="ltr">
              {lastTime}
            </p>
          </div>
        )}
      </div>

      {/* מד התקדמות */}
      <div
        role="progressbar"
        // קיפוץ ל-[0, יעד] כדי שלא לחרוג מ-aria-valuemax כאשר עוברים את היעד
        aria-valuenow={Math.min(Math.max(total, 0), user.prescribedDailyDose)}
        aria-valuemin={0}
        aria-valuemax={user.prescribedDailyDose}
        aria-valuetext={`${total} מתוך ${user.prescribedDailyDose} מ"ג`}
        aria-label="התקדמות יומית"
        className="h-3 w-full overflow-hidden rounded-full bg-brand-50"
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
