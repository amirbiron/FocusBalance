import { Link } from 'react-router-dom';
import { LifeBuoy } from 'lucide-react';

/**
 * פוטר עדין — מציג בכל מסך קישור ל"מתי לפנות לעזרה".
 * דרישה מסעיף 9 באפיון (אזהרות וצמצום סיכונים).
 */
export function Footer() {
  return (
    <div className="fixed bottom-16 inset-x-0 z-0 pointer-events-none flex justify-center sm:bottom-20">
      <Link
        to="/help"
        className="pointer-events-auto inline-flex items-center gap-1 text-xs text-slate-400 hover:text-brand-600 transition px-3 py-1"
      >
        <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" />
        <span>מתי לפנות לעזרה</span>
      </Link>
    </div>
  );
}
