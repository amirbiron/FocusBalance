import { useState } from 'react';
import { AlertTriangle, Phone } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  onBack: () => void;
  onAccept: () => void;
}

/**
 * מסך disclaimer מפורש לפני המשך לאונבורדינג.
 * דרישה מסעיף 9 ב-docs/FocusBalance.md.
 */
export function DisclaimerStep({ onBack, onAccept }: Props) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-warning-50 text-warning-600">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-bold text-brand-700">חשוב לקרוא</h1>
      </div>

      <div className="space-y-3 text-slate-700 leading-relaxed">
        <p>
          <strong className="text-brand-700">FocusBalance הוא כלי מעקב אישי, לא כלי רפואי.</strong>
        </p>
        <p>
          המידע באפליקציה אינו מהווה ייעוץ רפואי, אבחנה או המלצה לטיפול.
          האפליקציה אינה מחליפה התייעצות עם רופא מטפל.
        </p>
        <p>
          <strong>כל שינוי במינון</strong> — הפחתה, העלאה, הוספה או דילוג —
          חייב להיעשות אך ורק בהתייעצות עם הרופא שרשם לך את התרופה.
        </p>
        <p>
          אם אתה חווה תופעות לוואי משמעותיות (דופק מהיר, חרדה קיצונית, כאבי חזה,
          הזיות, מחשבות אובדניות) — הפסק שימוש ופנה מיד לעזרה רפואית.
        </p>
      </div>

      <div className="rounded-2xl bg-warning-50 border border-warning-500/30 p-4 text-sm text-slate-700 space-y-2">
        <p className="font-semibold text-warning-600">במקרה חירום</p>
        <div className="flex flex-wrap gap-3">
          <a href="tel:101" className="inline-flex items-center gap-1 text-warning-600 font-semibold" dir="ltr">
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>101</span>
            <span className="text-slate-600 font-normal">— מד״א</span>
          </a>
          <a href="tel:1201" className="inline-flex items-center gap-1 text-warning-600 font-semibold" dir="ltr">
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>1201</span>
            <span className="text-slate-600 font-normal">— ער״ן</span>
          </a>
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer rounded-2xl bg-brand-50/60 p-4 border border-brand-100">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-brand-300 text-brand focus:ring-brand-400"
        />
        <span className="text-sm text-slate-700">
          קראתי והבנתי. אני מתחייב להתייעץ עם הרופא המטפל בכל שינוי מינון,
          ואשתמש ב-FocusBalance ככלי מעקב בלבד.
        </span>
      </label>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          חזרה
        </Button>
        <Button onClick={onAccept} disabled={!acknowledged} className="flex-1">
          אני מסכים
        </Button>
      </div>
    </div>
  );
}
