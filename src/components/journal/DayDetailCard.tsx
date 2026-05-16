import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Pencil, Trash2, X, Check, Clock } from 'lucide-react';
import {
  getDoseEventsForDay,
  deleteDoseEvent,
  updateDoseEvent,
} from '@/db/repositories/doses';
import { listTriggers } from '@/db/repositories/triggers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isValidPositiveNumber } from '@/lib/utils';
import {
  classifyDayStatus,
  statusColors,
  sumAmountMg,
} from '@/lib/doseHelpers';
import type { DoseEvent, Trigger } from '@/db/schema';

interface Props {
  dateKey: string; // YYYY-MM-DD
  targetMg: number;
}

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
 * כרטיס פירוט יום: רשימת מנות, סך הכל מול היעד, ופעולות
 * עריכה/מחיקה רטרואקטיביות (סעיף 4.5 באפיון).
 */
export function DayDetailCard({ dateKey, targetMg }: Props) {
  const events = useLiveQuery(() => getDoseEventsForDay(dateKey), [dateKey], []);
  const triggers = useLiveQuery(() => listTriggers(), [], []);
  const triggersById = new Map<number, Trigger>();
  for (const t of triggers ?? []) {
    if (t.id !== undefined) triggersById.set(t.id, t);
  }

  const total = sumAmountMg(events);
  const status = classifyDayStatus(total, targetMg);
  const colors = statusColors(status);

  // פורמט תאריך לכותרת
  const [y, m, d] = dateKey.split('-').map(Number);
  const dateLabel =
    y && m && d ? `${d} ב${MONTHS_HE[m - 1]} ${y}` : dateKey;

  // מיון לפי שעת נטילה
  const sorted = [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-brand-700">{dateLabel}</h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.bg} ${colors.text}`}
        >
          {colors.label}
        </span>
      </div>

      <p className="text-sm text-slate-600">
        סה"כ:{' '}
        <strong className="text-brand-700">
          <span dir="ltr">{total}</span> / <span dir="ltr">{targetMg}</span> מ"ג
        </strong>{' '}
        · {sorted.length} מנות
      </p>

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">
          לא תועדו מנות ביום זה.
        </p>
      ) : (
        <ul className="divide-y divide-brand-100/60">
          {sorted.map((event) => (
            <DoseRow
              key={event.id}
              event={event}
              triggersById={triggersById}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface RowProps {
  event: DoseEvent;
  triggersById: Map<number, Trigger>;
}

function DoseRow({ event, triggersById }: RowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const time = new Date(event.timestamp).toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const eventTriggers = event.triggerIds
    .map((id) => triggersById.get(id))
    .filter((t): t is Trigger => Boolean(t));

  if (isEditing && event.id !== undefined) {
    return (
      <li className="py-3">
        <EditForm
          event={event}
          onCancel={() => setIsEditing(false)}
          onSaved={() => setIsEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="py-3 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span dir="ltr" className="font-mono">
            {time}
          </span>
          <span className="font-semibold text-brand-700">
            <span dir="ltr">{event.amountMg}</span> מ"ג
          </span>
          {!event.isPlanned && (
            <span className="text-xs text-warning-600 rounded-full bg-warning-50 px-2 py-0.5">
              לא מתוכננת
            </span>
          )}
        </div>
        {eventTriggers.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {eventTriggers.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 text-xs"
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </span>
            ))}
          </div>
        )}
        {event.notes && (
          <p className="mt-1 text-xs text-slate-500 break-words">{event.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isConfirmingDelete ? (
          <>
            <button
              type="button"
              onClick={async () => {
                if (event.id !== undefined) await deleteDoseEvent(event.id);
              }}
              className="inline-flex h-8 px-2 items-center justify-center rounded-xl bg-warm text-white text-xs font-semibold hover:bg-warm-600"
            >
              מחק
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
              aria-label="ביטול מחיקה"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-brand-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label="ערוך מנה"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-brand-50 hover:text-brand-700"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              aria-label="מחק מנה"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-warm-50 hover:text-warm-600"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

interface EditProps {
  event: DoseEvent;
  onCancel: () => void;
  onSaved: () => void;
}

function EditForm({ event, onCancel, onSaved }: EditProps) {
  const initialTime = new Date(event.timestamp).toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const [time, setTime] = useState(initialTime);
  const [amount, setAmount] = useState(String(event.amountMg));
  const [notes, setNotes] = useState(event.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // משחזרים את תאריך הרשומה (לוקאלי) — מאפשר עריכה של שעה בלי לשנות יום
  const eventDate = new Date(event.timestamp);

  const handleSave = async () => {
    if (isSaving) return;
    const amountNum = Number(amount);
    if (!isValidPositiveNumber(amountNum, 200)) {
      setError('כמות לא תקינה');
      return;
    }
    // ולידציית שעה — todayTimeToIso משתמש בתאריך היום, אבל אנחנו רוצים
    // לשמר את התאריך המקורי של הרשומה. בודקים פורמט ובונים מקומית.
    const parts = time.split(':');
    if (parts.length !== 2) {
      setError('שעה לא תקינה');
      return;
    }
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      setError('שעה לא תקינה');
      return;
    }
    const newTimestamp = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
      h,
      m,
      0,
      0
    ).toISOString();

    setError(null);
    setIsSaving(true);
    try {
      if (event.id !== undefined) {
        await updateDoseEvent(event.id, {
          timestamp: newTimestamp,
          amountMg: amountNum,
          notes: notes.trim() || undefined,
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שמירה נכשלה');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3 rounded-2xl bg-brand-50/40 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Input
          label="שעה"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          dir="ltr"
        />
        <Input
          label='מ"ג'
          type="number"
          min={1}
          max={200}
          step="0.5"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <Input
        label="הערה"
        type="text"
        maxLength={200}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      {error && <p className="text-xs text-warning-600">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
          ביטול
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          {isSaving ? 'שומר…' : 'שמור'}
        </Button>
      </div>
    </div>
  );
}
