import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-surface/80 border-b border-brand-100/60">
      <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand text-white shadow-soft">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold text-brand-700 group-hover:text-brand">
            FocusBalance
          </span>
        </Link>
        <span className="text-xs text-slate-500">איזון פוקוס</span>
      </div>
    </header>
  );
}
