import { useLiveQuery } from 'dexie-react-hooks';
import { Flame, Sprout } from 'lucide-react';
import { getRecentDays } from '@/db/repositories/doses';
import { aggregateByDay, calculateStreak } from '@/lib/doseHelpers';
import type { User } from '@/db/schema';

interface Props {
  user: User;
}

/**
 * רצף ימים ביעד (סעיף 4.1.3 באפיון).
 * Gamification עדינה — חיזוק חיובי בלי לחץ.
 */
export function StreakCard({ user }: Props) {
  // 365 ימים — תואם לתקרה הפנימית של calculateStreak כדי שרצף ארוך
  // לא ייקטע ע"י חלון השאילתה
  const events = useLiveQuery(() => getRecentDays(365), [], []);
  const byDay = aggregateByDay(events);
  const streak = calculateStreak(byDay, user.prescribedDailyDose);

  // טקסט מעודד לפי גודל הרצף — בלי לחץ אם זה 0
  const message =
    streak === 0
      ? 'מתחילים מחר ✨'
      : streak === 1
      ? 'יום אחד ביעד — התחלה מצוינת'
      : streak < 5
      ? `${streak} ימים ברצף ביעד 🌱`
      : streak < 14
      ? `${streak} ימים ברצף ביעד 🌿`
      : `${streak} ימים ברצף ביעד 🔥`;

  const Icon = streak >= 5 ? Flame : Sprout;

  return (
    <div className="card flex items-center gap-4">
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-700">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="flex-1">
        <p className="font-semibold text-brand-700">{message}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          רצף שמתחיל מהיום הראשון שעמדת ביעד
        </p>
      </div>
    </div>
  );
}
