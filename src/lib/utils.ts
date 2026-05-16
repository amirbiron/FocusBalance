import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** מאחד class names עם תמיכה במיזוג של Tailwind */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * ולידציה של ערך מספרי — בדיקת NaN, Infinity, וטווח.
 * מימוש לפי כלל 4 ב-CLAUDE.md.
 */
export function isValidPositiveNumber(value: unknown, max = 1000): value is number {
  if (typeof value !== 'number') return false;
  if (Number.isNaN(value)) return false;
  if (!Number.isFinite(value)) return false;
  if (value <= 0) return false;
  if (value > max) return false;
  return true;
}
