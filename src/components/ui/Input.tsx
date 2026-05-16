import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

/** רכיב קלט נגיש עם תווית, רמז ושגיאה. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, id, ...rest }, ref) => {
    // useId נותן מזהה יציב בין רנדורים (במקום Math.random שיוצר חדש בכל פעם)
    const generatedId = useId();
    const inputId = id ?? generatedId;
    // הצגת hint רק כשאין error — לכן גם ה-id נחשף ב-aria רק במקרה הזה
    const showHint = Boolean(hint) && !error;
    const hintId = showHint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          aria-invalid={error ? 'true' : undefined}
          className={cn(
            'block w-full rounded-2xl border border-brand-100 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition',
            'placeholder:text-slate-400',
            'focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200',
            error && 'border-warning-500 focus:border-warning-500 focus:ring-warning-500/30',
            className
          )}
          {...rest}
        />
        {showHint && (
          <p id={hintId} className="text-xs text-slate-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-warning-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
