import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Check, Clock, Heart } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useQuickLogStore } from '@/store/quickLogStore';
import { useLocalUser } from '@/hooks/useLocalUser';
import { listTriggersByCategory } from '@/db/repositories/triggers';
import { addDoseEvent, getTodayDoseEvents } from '@/db/repositories/doses';
import {
  isPlannedDose,
  nowAsTimeString,
  sumAmountMg,
  todayTimeToIso,
  wouldExceedDailyTarget,
} from '@/lib/doseHelpers';
import { isValidPositiveNumber } from '@/lib/utils';
import type { Trigger, TriggerCategory } from '@/db/schema';

type Step = 'when' | 'how-much' | 'why' | 'done';

const CATEGORY_LABELS: Record<TriggerCategory, { label: string; icon: string }> = {
  task: { label: 'משימה', icon: '🎯' },
  cognitive: { label: 'קוגניטיבי', icon: '🧠' },
  physical: { label: 'פיזי', icon: '😴' },
  emotional: { label: 'רגשי', icon: '😰' },
  habit: { label: 'הרגל', icon: '🔄' },
  other: { label: 'אחר', icon: '✨' },
};

export function QuickLogModal() {
  const isOpen = useQuickLogStore((s) => s.isOpen);
  const close = useQuickLogStore((s) => s.close);
  const user = useLocalUser();

  const triggersByCategory = useLiveQuery(() => listTriggersByCategory(), []);
  const todayEvents = useLiveQuery(() => getTodayDoseEvents(), [], []);

  const [step, setStep] = useState<Step>('when');
  const [useNow, setUseNow] = useState(true);
  const [customTime, setCustomTime] = useState<string>(nowAsTimeString());
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedTriggers, setSelectedTriggers] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [didExceed, setDidExceed] = useState(false);

  // איפוס הסטייט בכל פתיחה מחדש
  useEffect(() => {
    if (!isOpen) return;
    setStep('when');
    setUseNow(true);
    setCustomTime(nowAsTimeString());
    setAmount(null);
    setCustomAmount('');
    setSelectedTriggers([]);
    setNotes('');
    setError(null);
    setDidExceed(false);
    setIsSaving(false);
  }, [isOpen]);

  const finalAmount = useMemo<number | null>(() => {
    if (amount !== null) return amount;
    const n = Number(customAmount);
    return isValidPositiveNumber(n, 200) ? n : null;
  }, [amount, customAmount]);

  if (!user) return null;

  const toggleTrigger = (id: number) => {
    setSelectedTriggers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (finalAmount === null) {
      setError('יש לבחור כמות תקינה');
      setStep('how-much');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const timestamp = useNow ? new Date().toISOString() : todayTimeToIso(customTime);
      const planned = isPlannedDose(timestamp, user.scheduledTimes);
      const exceeded = wouldExceedDailyTarget(user, todayEvents ?? [], finalAmount);

      await addDoseEvent({
        timestamp,
        amountMg: finalAmount,
        isPlanned: planned,
        triggerIds: selectedTriggers,
        notes: notes.trim() || undefined,
      });
      setDidExceed(exceeded);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שמירה נכשלה');
    } finally {
      setIsSaving(false);
    }
  };

  const titleByStep: Record<Step, string> = {
    when: 'מתי לקחת?',
    'how-much': 'כמה?',
    why: 'מה הוביל לזה?',
    done: 'תועד',
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title={titleByStep[step]}>
      {/* מחוון התקדמות */}
      {step !== 'done' && (
        <div className="mb-5 flex items-center gap-1.5">
          {(['when', 'how-much', 'why'] as Step[]).map((s) => (
            <div
              key={s}
              className={
                step === s
                  ? 'h-1.5 flex-1 rounded-full bg-brand'
                  : 'h-1.5 flex-1 rounded-full bg-brand-100'
              }
            />
          ))}
        </div>
      )}

      {step === 'when' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUseNow(true)}
              className={
                useNow
                  ? 'rounded-2xl border-2 border-brand bg-brand-50 p-5 text-center transition'
                  : 'rounded-2xl border-2 border-transparent bg-brand-50/40 p-5 text-center transition hover:bg-brand-50'
              }
            >
              <span className="block text-2xl mb-1">⚡</span>
              <span className="block font-semibold text-brand-700">עכשיו</span>
            </button>
            <button
              type="button"
              onClick={() => setUseNow(false)}
              className={
                !useNow
                  ? 'rounded-2xl border-2 border-brand bg-brand-50 p-5 text-center transition'
                  : 'rounded-2xl border-2 border-transparent bg-brand-50/40 p-5 text-center transition hover:bg-brand-50'
              }
            >
              <Clock className="mx-auto h-7 w-7 text-brand-700 mb-1" aria-hidden="true" />
              <span className="block font-semibold text-brand-700">בחר שעה</span>
            </button>
          </div>

          {!useNow && (
            <Input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              dir="ltr"
              label="שעת הנטילה היום"
            />
          )}

          <Button onClick={() => setStep('how-much')} className="w-full">
            המשך
          </Button>
        </div>
      )}

      {step === 'how-much' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">בחר מינון מהמהירים, או הזן ידנית:</p>
          <div className="flex flex-wrap gap-2">
            {user.unitDoses.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => {
                  setAmount(u);
                  setCustomAmount('');
                }}
                className={
                  amount === u
                    ? 'rounded-2xl border-2 border-brand bg-brand text-white px-5 py-2.5 font-semibold transition'
                    : 'rounded-2xl border-2 border-brand-100 bg-white px-5 py-2.5 text-brand-700 font-semibold hover:bg-brand-50 transition'
                }
              >
                <span dir="ltr">{u}</span>
                <span className="text-xs opacity-80"> מ"ג</span>
              </button>
            ))}
          </div>

          <div>
            <Input
              type="number"
              inputMode="decimal"
              min={1}
              max={200}
              step="0.5"
              placeholder='או הזן מינון אחר (מ"ג)'
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setAmount(null);
              }}
            />
          </div>

          {error && <p className="text-sm text-warning-600">{error}</p>}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('when')} className="flex-1">
              חזרה
            </Button>
            <Button
              onClick={() => {
                if (finalAmount === null) {
                  setError('יש לבחור כמות תקינה');
                  return;
                }
                setError(null);
                setStep('why');
              }}
              className="flex-1"
            >
              המשך
            </Button>
          </div>
        </div>
      )}

      {step === 'why' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            אפשר לדלג. אם תספר לנו — נוכל לזהות דפוסים שיעזרו לך בהמשך.
          </p>

          {triggersByCategory &&
            (Object.keys(triggersByCategory) as TriggerCategory[]).map((cat) => {
              const items: Trigger[] = triggersByCategory[cat];
              if (items.length === 0) return null;
              const meta = CATEGORY_LABELS[cat];
              return (
                <div key={cat}>
                  <p className="mb-1.5 text-xs font-semibold text-slate-500">
                    {meta.icon} {meta.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((t) => {
                      const selected = t.id !== undefined && selectedTriggers.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => t.id !== undefined && toggleTrigger(t.id)}
                          className={
                            selected
                              ? 'inline-flex items-center gap-1 rounded-full border-2 border-brand bg-brand text-white px-3 py-1 text-sm transition'
                              : 'inline-flex items-center gap-1 rounded-full border border-brand-100 bg-white text-brand-700 px-3 py-1 text-sm hover:bg-brand-50 transition'
                          }
                        >
                          <span>{t.icon}</span>
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          <Input
            label="הערה (אופציונלי)"
            type="text"
            maxLength={200}
            placeholder="משהו שכדאי לזכור?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {error && <p className="text-sm text-warning-600">{error}</p>}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('how-much')} className="flex-1">
              חזרה
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? 'שומר…' : 'תעד מנה'}
            </Button>
          </div>

          <p className="text-center text-xs">
            <button
              type="button"
              onClick={() => {
                setSelectedTriggers([]);
                setNotes('');
                handleSave();
              }}
              className="text-slate-500 hover:text-brand-700"
              disabled={isSaving}
            >
              דלג ותעד
            </button>
          </p>
        </div>
      )}

      {step === 'done' && (
        <DoneScreen
          exceeded={didExceed}
          totalToday={sumAmountMg(todayEvents ?? [])}
          target={user.prescribedDailyDose}
          onClose={close}
        />
      )}
    </Modal>
  );
}

interface DoneProps {
  exceeded: boolean;
  totalToday: number;
  target: number;
  onClose: () => void;
}

/**
 * מסך אישור. הטקסט משתנה לפי האם המנה הביאה לחריגה מהיעד.
 * חשוב: בלי הודעה אדומה, בלי שיפוט (סעיף 2 באפיון — "חמלה לפני שיפוט").
 */
function DoneScreen({ exceeded, totalToday, target, onClose }: DoneProps) {
  return (
    <div className="text-center space-y-4 py-2">
      <div className="flex justify-center">
        <span
          className={
            exceeded
              ? 'inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-warning-50 text-warning-600 shadow-soft'
              : 'inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-accent-50 text-accent-700 shadow-soft'
          }
        >
          {exceeded ? (
            <Heart className="h-7 w-7" aria-hidden="true" />
          ) : (
            <Check className="h-7 w-7" aria-hidden="true" />
          )}
        </span>
      </div>

      {exceeded ? (
        <>
          <h3 className="text-lg font-bold text-brand-700">תועד 💜</h3>
          <p className="text-slate-600">
            המנה הזאת מעבר ליעד היומי שלך. ננתח את זה ביחד מחר — בלי שיפוט,
            רק כדי להבין מה קרה.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-bold text-brand-700">תועד ✓</h3>
          <p className="text-slate-600">המשך יום מצוין.</p>
        </>
      )}

      <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-slate-700">
        סה"כ היום:{' '}
        <strong className="text-brand-700">
          <span dir="ltr">{totalToday}</span> / <span dir="ltr">{target}</span> מ"ג
        </strong>
      </div>

      <Button onClick={onClose} className="w-full">
        סגירה
      </Button>
    </div>
  );
}
