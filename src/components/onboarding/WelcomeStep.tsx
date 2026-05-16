import { Sparkles, Heart, ShieldCheck, ChartNoAxesColumn } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: Props) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-brand text-white shadow-soft-lg">
          <Sparkles className="h-8 w-8" aria-hidden="true" />
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-brand-700">ברוך הבא ל-FocusBalance</h1>
        <p className="mt-2 text-slate-600">
          כלי מעקב אישי שיעזור לך להבין ולאזן את צריכת הריטלין שלך —
          בלי שיפוט, בלי לחץ, רק נתונים שעובדים בשבילך.
        </p>
      </div>

      <ul className="space-y-3 text-start">
        <li className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Heart className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-sm text-slate-700">
            <strong className="text-brand-700">חמלה לפני שיפוט</strong> — בלי הודעות
            "נכשלת", רק תובנות שמקדמות אותך.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <ChartNoAxesColumn className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-sm text-slate-700">
            <strong className="text-brand-700">תובנות, לא נתונים גולמיים</strong> — גרפים
            שמספרים סיפור.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-sm text-slate-700">
            <strong className="text-brand-700">פרטיות מלאה</strong> — כל הנתונים שלך
            נשמרים מקומית בדפדפן, בלי שיתוף לצד ג'.
          </span>
        </li>
      </ul>

      <Button size="lg" className="w-full" onClick={onNext}>
        בוא נתחיל
      </Button>
    </div>
  );
}
