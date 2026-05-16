import { LifeBuoy, Phone } from 'lucide-react';

/**
 * עמוד "מתי לפנות לעזרה" — דרישה מסעיף 9 באפיון.
 * מספרי הטלפון נשמרים LTR כדי שלא יישברו ב-bidi
 * (כלל מ-docs/Skill/hebrew-rtl-best-practices.md).
 */
export function HelpPage() {
  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <LifeBuoy className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-bold text-brand-700">מתי לפנות לעזרה</h1>
      </div>

      <p className="text-slate-700">
        אם אתה חווה תופעות לוואי משמעותיות (דופק מהיר, חרדה קיצונית, כאבי חזה,
        קשיי שינה ממושכים) — חשוב לפנות לעזרה מקצועית.
      </p>

      <div className="rounded-2xl bg-brand-50 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-brand-700">מד"א — חירום רפואי</p>
            <p className="text-sm text-slate-600">24/7</p>
          </div>
          <a
            href="tel:101"
            className="btn-primary text-base"
            dir="ltr"
            aria-label="חיוג למד״א"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>101</span>
          </a>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-brand-700">ער"ן — תמיכה נפשית</p>
            <p className="text-sm text-slate-600">24/7, אנונימי וחינמי</p>
          </div>
          <a
            href="tel:1201"
            className="btn-primary text-base"
            dir="ltr"
            aria-label="חיוג לער״ן"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>1201</span>
          </a>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        FocusBalance הוא כלי מעקב אישי בלבד — לא תחליף לייעוץ רפואי.
        כל שינוי מינון חייב להיעשות בהתייעצות עם הרופא המטפל.
      </p>
    </div>
  );
}
