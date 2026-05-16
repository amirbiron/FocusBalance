import { useState, type FormEvent } from 'react';
import { Plus, X, Clock } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { isValidPositiveNumber } from '@/lib/utils';

interface Props {
  onBack: () => void;
  onSubmit: (data: {
    prescribedDailyDose: number;
    unitDoses: number[];
    scheduledTimes: string[];
    doctorName?: string;
  }) => void | Promise<void>;
}

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * שלב הקלת פרטי הפרופיל הרפואי.
 * ולידציה לפי כלל 4 — בודקים NaN/Infinity וטווחים סבירים.
 * שמירת הנתונים תיעשה ב-handler החיצוני.
 */
export function ProfileStep({ onBack, onSubmit }: Props) {
  const [prescribedRaw, setPrescribedRaw] = useState('');
  const [unitDoses, setUnitDoses] = useState<string[]>(['10', '20']);
  const [scheduledTimes, setScheduledTimes] = useState<string[]>(['09:00']);
  const [doctorName, setDoctorName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const updateUnit = (i: number, val: string) => {
    setUnitDoses((prev) => prev.map((v, idx) => (idx === i ? val : v)));
  };
  const addUnit = () => setUnitDoses((prev) => [...prev, '']);
  const removeUnit = (i: number) => setUnitDoses((prev) => prev.filter((_, idx) => idx !== i));

  const updateTime = (i: number, val: string) => {
    setScheduledTimes((prev) => prev.map((v, idx) => (idx === i ? val : v)));
  };
  const addTime = () => setScheduledTimes((prev) => [...prev, '12:00']);
  const removeTime = (i: number) => setScheduledTimes((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // ולידציה של מינון מרשם — כלל 4 ב-CLAUDE.md
    const prescribed = Number(prescribedRaw);
    if (!isValidPositiveNumber(prescribed, 500)) {
      newErrors.prescribed = 'יש להזין מספר תקין בין 1 ל-500 מ"ג';
    }

    // ולידציה של מינוני יחידה
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

    // ולידציה של שעות
    const cleanTimes: string[] = [];
    for (let i = 0; i < scheduledTimes.length; i++) {
      const t = (scheduledTimes[i] ?? '').trim();
      if (t === '') continue;
      if (!TIME_REGEX.test(t)) {
        newErrors[`time-${i}`] = 'פורמט שעה לא תקין (HH:MM)';
      } else {
        cleanTimes.push(t);
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSaving(true);
    try {
      await onSubmit({
        prescribedDailyDose: prescribed,
        unitDoses: Array.from(new Set(parsedUnits)).sort((a, b) => a - b),
        scheduledTimes: Array.from(new Set(cleanTimes)).sort(),
        doctorName: doctorName.trim() || undefined,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'שמירת הפרופיל נכשלה';
      setErrors({ submit: msg });
    } finally {
      // משחררים את ה-flag גם בהצלחה — אם ניווט לא קרה מסיבה כלשהי,
      // המשתמש לא נתקע עם טופס נעול
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <h1 className="text-xl font-bold text-brand-700">בוא נכיר את המינון שלך</h1>
        <p className="mt-1 text-sm text-slate-600">
          הנתונים האלה נשמרים אצלך בדפדפן בלבד ועוזרים לאפליקציה לחשב את היעד היומי.
        </p>
      </div>

      <Input
        label='מינון מרשם יומי (מ"ג)'
        type="number"
        inputMode="decimal"
        min={1}
        max={500}
        step="0.5"
        placeholder="לדוגמה: 30"
        value={prescribedRaw}
        onChange={(e) => setPrescribedRaw(e.target.value)}
        error={errors.prescribed}
        hint="הסכום הכולל היומי שרשם לך הרופא"
      />

      {/* מינוני יחידה */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          מינוני יחידה (מ"ג)
        </label>
        <p className="text-xs text-slate-500">
          המינונים שאתה לוקח בכל פעם — יופיעו ככפתורי תיעוד מהיר.
        </p>
        <div className="space-y-2">
          {unitDoses.map((val, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="decimal"
                min={1}
                max={200}
                step="0.5"
                placeholder='מ"ג'
                value={val}
                onChange={(e) => updateUnit(i, e.target.value)}
                error={errors[`unit-${i}`]}
                className="flex-1"
              />
              {unitDoses.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUnit(i)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 hover:bg-brand-50 hover:text-warning-600"
                  aria-label={`הסר מינון ${i + 1}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.units && <p className="text-xs text-warning-600">{errors.units}</p>}
        <Button type="button" variant="ghost" size="sm" onClick={addUnit}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          הוסף מינון
        </Button>
      </div>

      {/* שעות מתוכננות */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          שעות נטילה מתוכננות
        </label>
        <p className="text-xs text-slate-500">
          לפי הנחיות הרופא — נשתמש בזה לזיהוי מנות מתוכננות מול נוספות.
        </p>
        <div className="space-y-2">
          {scheduledTimes.map((val, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-slate-400">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                </span>
                <Input
                  type="time"
                  value={val}
                  onChange={(e) => updateTime(i, e.target.value)}
                  error={errors[`time-${i}`]}
                  className="pe-10"
                  dir="ltr"
                />
              </div>
              <button
                type="button"
                onClick={() => removeTime(i)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 hover:bg-brand-50 hover:text-warning-600"
                aria-label={`הסר שעה ${i + 1}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={addTime}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          הוסף שעה
        </Button>
      </div>

      <Input
        label="שם הרופא המטפל (אופציונלי)"
        type="text"
        maxLength={80}
        placeholder="לדוגמה: ד״ר כהן"
        value={doctorName}
        onChange={(e) => setDoctorName(e.target.value)}
        hint="לתזכורות לתיאום פגישה — לא נשלח לאף מקום."
      />

      {errors.submit && (
        <p className="text-sm text-warning-600">{errors.submit}</p>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={isSaving} className="flex-1">
          חזרה
        </Button>
        <Button type="submit" disabled={isSaving} className="flex-1">
          {isSaving ? 'שומר…' : 'סיום'}
        </Button>
      </div>
    </form>
  );
}
