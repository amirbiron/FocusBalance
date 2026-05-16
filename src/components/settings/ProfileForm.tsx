import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Plus, X, Clock, Check } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { isValidPositiveNumber } from '@/lib/utils';
import type { User } from '@/db/schema';

interface Props {
  user: User;
  onSave: (data: {
    prescribedDailyDose: number;
    unitDoses: number[];
    scheduledTimes: string[];
    doctorName?: string;
  }) => Promise<void>;
}

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * טופס עריכת פרופיל בעמוד ההגדרות.
 * משתמש באותה לוגיקת ולידציה כמו ProfileStep — אבל ערוך לעריכה חוזרת.
 */
export function ProfileForm({ user, onSave }: Props) {
  const [prescribedRaw, setPrescribedRaw] = useState(String(user.prescribedDailyDose));
  const [unitDoses, setUnitDoses] = useState<string[]>(
    user.unitDoses.length > 0 ? user.unitDoses.map(String) : ['10']
  );
  const [scheduledTimes, setScheduledTimes] = useState<string[]>(
    user.scheduledTimes.length > 0 ? user.scheduledTimes : ['09:00']
  );
  const [doctorName, setDoctorName] = useState(user.doctorName ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  // שמירה של ה-timeout כדי לבטל בעת unmount או שמירה חוזרת — מונע
  // הסתרה מוקדמת של ההודעה ועדכון state על קומפוננטה שכבר אינה במסך
  const savedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current !== null) {
        window.clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const prescribed = Number(prescribedRaw);
    if (!isValidPositiveNumber(prescribed, 500)) {
      newErrors.prescribed = 'יש להזין מספר תקין בין 1 ל-500 מ"ג';
    }

    const parsedUnits: number[] = [];
    for (let i = 0; i < unitDoses.length; i++) {
      const raw = unitDoses[i] ?? '';
      const num = Number(raw);
      if (raw.trim() === '' || !isValidPositiveNumber(num, 200)) {
        newErrors[`unit-${i}`] = 'מספר לא תקין';
      } else {
        parsedUnits.push(num);
      }
    }
    if (parsedUnits.length === 0) {
      newErrors.units = 'יש להגדיר לפחות מינון יחידה אחד';
    }

    const cleanTimes: string[] = [];
    for (let i = 0; i < scheduledTimes.length; i++) {
      const t = (scheduledTimes[i] ?? '').trim();
      if (t === '') continue;
      if (!TIME_REGEX.test(t)) {
        newErrors[`time-${i}`] = 'פורמט שעה לא תקין';
      } else {
        cleanTimes.push(t);
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSaving(true);
    try {
      await onSave({
        prescribedDailyDose: prescribed,
        unitDoses: Array.from(new Set(parsedUnits)).sort((a, b) => a - b),
        scheduledTimes: Array.from(new Set(cleanTimes)).sort(),
        doctorName: doctorName.trim() || undefined,
      });
      setSavedAt(Date.now());
      if (savedTimerRef.current !== null) {
        window.clearTimeout(savedTimerRef.current);
      }
      savedTimerRef.current = window.setTimeout(() => setSavedAt(null), 2500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'שמירה נכשלה';
      setErrors({ submit: msg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Input
        label='מינון מרשם יומי (מ"ג)'
        type="number"
        inputMode="decimal"
        min={1}
        max={500}
        step="0.5"
        value={prescribedRaw}
        onChange={(e) => setPrescribedRaw(e.target.value)}
        error={errors.prescribed}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">מינוני יחידה (מ"ג)</label>
        {unitDoses.map((val, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="decimal"
              min={1}
              max={200}
              step="0.5"
              value={val}
              onChange={(e) =>
                setUnitDoses((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
              }
              error={errors[`unit-${i}`]}
              className="flex-1"
            />
            {unitDoses.length > 1 && (
              <button
                type="button"
                onClick={() => setUnitDoses((prev) => prev.filter((_, idx) => idx !== i))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 hover:bg-brand-50 hover:text-warning-600"
                aria-label={`הסר מינון ${i + 1}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
        {errors.units && <p className="text-xs text-warning-600">{errors.units}</p>}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setUnitDoses((prev) => [...prev, ''])}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          הוסף מינון
        </Button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">שעות נטילה מתוכננות</label>
        {scheduledTimes.map((val, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-slate-400">
                <Clock className="h-4 w-4" aria-hidden="true" />
              </span>
              <Input
                type="time"
                value={val}
                onChange={(e) =>
                  setScheduledTimes((prev) =>
                    prev.map((v, idx) => (idx === i ? e.target.value : v))
                  )
                }
                error={errors[`time-${i}`]}
                className="pe-10"
                dir="ltr"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setScheduledTimes((prev) => prev.filter((_, idx) => idx !== i))
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 hover:bg-brand-50 hover:text-warning-600"
              aria-label={`הסר שעה ${i + 1}`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setScheduledTimes((prev) => [...prev, '12:00'])}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          הוסף שעה
        </Button>
      </div>

      <Input
        label="שם הרופא המטפל (אופציונלי)"
        type="text"
        maxLength={80}
        value={doctorName}
        onChange={(e) => setDoctorName(e.target.value)}
      />

      {errors.submit && <p className="text-sm text-warning-600">{errors.submit}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'שומר…' : 'שמור שינויים'}
        </Button>
        {savedAt && (
          <span className="inline-flex items-center gap-1 text-sm text-accent-600">
            <Check className="h-4 w-4" aria-hidden="true" />
            נשמר
          </span>
        )}
      </div>
    </form>
  );
}
