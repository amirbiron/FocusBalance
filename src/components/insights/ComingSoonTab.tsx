import { Clock } from 'lucide-react';

interface Props {
  title: string;
  description: string;
}

/** Placeholder אחיד לטאבי תובנות שיגיעו בגרסה 2 (סעיף 4.3 באפיון). */
export function ComingSoonTab({ title, description }: Props) {
  return (
    <div className="card text-center py-10 space-y-3">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 mx-auto">
        <Clock className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="font-bold text-brand-700">{title}</h3>
      <p className="text-sm text-slate-600 max-w-sm mx-auto">{description}</p>
      <p className="text-xs text-slate-400">בגרסה הבאה</p>
    </div>
  );
}
