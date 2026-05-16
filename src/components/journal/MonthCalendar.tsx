import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { getDoseEventsForMonth } from '@/db/repositories/doses';
import {
  aggregateByDay,
  classifyDayStatus,
  localDateKey,
  type DayStatus,
} from '@/lib/doseHelpers';
import { cn } from '@/lib/utils';

interface Props {
  year: number;
  month: number; // 0-11
  selectedDateKey: string | null;
  targetMg: number;
  onSelectDay: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAYS_HE = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const MONTHS_HE = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
];

/**
 * לוח שנה חודשי עם נקודה צבעונית לכל יום שיש בו נטילות
 * (סעיף 4.5 באפיון). ירוק / צהוב / כתום — בלי אדום.
 */
export function MonthCalendar({
  year,
  month,
  selectedDateKey,
  targetMg,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
}: Props) {
  const events = useLiveQuery(
    () => getDoseEventsForMonth(year, month),
    [year, month],
    []
  );
  const byDay = aggregateByDay(events);

  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstOfMonth.getDay(); // 0=Sunday=ראשון

  // 6 שורות × 7 ימים = 42 תאים, ימים ריקים בהתחלה ובסוף
  const cells: Array<{ day: number | null; dateKey: string | null }> = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push({ day: null, dateKey: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({ day: d, dateKey: localDateKey(date) });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null, dateKey: null });
  }

  const todayKey = localDateKey(new Date());

  return (
    <div className="card">
      {/* כותרת + ניווט בין חודשים */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label="חודש קודם"
          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-brand-700 hover:bg-brand-50"
        >
          {/* בכיוון RTL "קודם" = שמאל מבחינה לוגית. icon-directional משקף אוטומטית */}
          <ChevronRight className="h-5 w-5 icon-directional" aria-hidden="true" />
        </button>
        <h2 className="text-lg font-bold text-brand-700">
          {MONTHS_HE[month]} <span dir="ltr">{year}</span>
        </h2>
        <button
          type="button"
          onClick={onNextMonth}
          aria-label="חודש הבא"
          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-brand-700 hover:bg-brand-50"
        >
          <ChevronLeft className="h-5 w-5 icon-directional" aria-hidden="true" />
        </button>
      </div>

      {/* כותרות ימים */}
      <div className="mb-1.5 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS_HE.map((d) => (
          <div key={d} className="text-xs font-semibold text-slate-500">
            {d}
          </div>
        ))}
      </div>

      {/* תאי הלוח */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (cell.day === null || cell.dateKey === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }
          const total = byDay.get(cell.dateKey) ?? 0;
          const status = classifyDayStatus(total, targetMg);
          const isSelected = selectedDateKey === cell.dateKey;
          const isToday = cell.dateKey === todayKey;

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => onSelectDay(cell.dateKey!)}
              aria-label={`${cell.day} ב${MONTHS_HE[month]}, ${total} מ"ג`}
              aria-pressed={isSelected}
              className={cn(
                'aspect-square flex flex-col items-center justify-center rounded-xl transition relative',
                isSelected
                  ? 'bg-brand text-white shadow-soft'
                  : isToday
                  ? 'bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                  : 'bg-white hover:bg-brand-50 text-slate-700'
              )}
            >
              <span className="text-sm font-medium" dir="ltr">
                {cell.day}
              </span>
              <StatusDot status={status} highlight={isSelected} />
            </button>
          );
        })}
      </div>

      {/* מקרא */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <LegendDot status="in-target" label="ביעד" />
        <LegendDot status="slightly-over" label="מעט מעל" />
        <LegendDot status="over" label="מעל" />
      </div>
    </div>
  );
}

function dotColor(status: DayStatus): string {
  switch (status) {
    case 'in-target':
      return 'bg-accent';
    case 'slightly-over':
      return 'bg-warning-500';
    case 'over':
      return 'bg-warm';
    case 'empty':
      return 'bg-transparent';
  }
}

function StatusDot({ status, highlight }: { status: DayStatus; highlight: boolean }) {
  if (status === 'empty') return <span className="mt-1 h-1.5 w-1.5" aria-hidden="true" />;
  return (
    <span
      className={cn(
        'mt-1 h-1.5 w-1.5 rounded-full',
        highlight ? 'bg-white' : dotColor(status)
      )}
      aria-hidden="true"
    />
  );
}

function LegendDot({ status, label }: { status: DayStatus; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn('h-2 w-2 rounded-full', dotColor(status))} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
