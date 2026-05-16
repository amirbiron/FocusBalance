/**
 * מודל הנתונים של FocusBalance.
 * מבוסס על סעיף 5 ב-docs/FocusBalance.md.
 *
 * הערה חשובה: בכל ה-MVP יש משתמש יחיד מקומי (אין auth).
 * מזהה המשתמש נשמר במסד ובהגדרות, אבל אין שיתוף או שליחה לשרת.
 */

/** קטגוריות הטריגרים מתוך האפיון (סעיף 4.2) */
export type TriggerCategory =
  | 'task' // משימה
  | 'cognitive' // קוגניטיבי
  | 'physical' // פיזי
  | 'emotional' // רגשי
  | 'habit' // הרגל
  | 'other'; // אחר

export interface User {
  id: number; // תמיד 1 ב-MVP (משתמש יחיד מקומי)
  /** מינון מרשם יומי במ"ג */
  prescribedDailyDose: number;
  /** מינוני יחידה לכפתורי תיעוד מהיר */
  unitDoses: number[];
  /** שעות נטילה מתוכננות בפורמט "HH:MM" */
  scheduledTimes: string[];
  /** שם הרופא המטפל — אופציונלי, נשמר רק מקומית */
  doctorName?: string;
  /** האם המשתמש סיים אונבורדינג והסכים ל-disclaimer */
  hasAcceptedDisclaimer: boolean;
  /** מזהה התוכנית הפעילה — אם קיימת */
  activeReductionPlanId?: number;
  /** זמן יצירה (ISO) */
  createdAt: string;
  /** זמן עדכון אחרון (ISO) */
  updatedAt: string;
}

export interface DoseEvent {
  id?: number;
  userId: number;
  /** מועד נטילה (ISO 8601) */
  timestamp: string;
  /** מינון במ"ג */
  amountMg: number;
  /** האם הנטילה הייתה מתוכננת (לפי scheduled_times) */
  isPlanned: boolean;
  /** מזהי טריגרים שנבחרו */
  triggerIds: number[];
  /** הערה חופשית מהמשתמש */
  notes?: string;
  /** זמן יצירת הרשומה — לעריכה רטרואקטיבית */
  createdAt: string;
}

export interface Trigger {
  id?: number;
  category: TriggerCategory;
  /** תווית בעברית */
  label: string;
  /** אייקון (emoji או שם מ-lucide) */
  icon: string;
  /** האם זה טריגר ברירת-מחדל שנטען עם ה-seed */
  isSystem: boolean;
}

export interface ReductionPlan {
  id?: number;
  userId: number;
  /** תאריך התחלה (ISO date) */
  startDate: string;
  /** יעד תאריך סיום (ISO date) */
  targetDate: string;
  /** מינון התחלתי במ"ג ליום */
  startDoseMg: number;
  /** מינון יעד במ"ג ליום */
  targetDoseMg: number;
  /** קצב */
  pace: 'slow' | 'moderate' | 'fast';
  /** אבני דרך שבועיות: מערך של { weekIndex, targetDoseMg } */
  weeklyMilestones: Array<{ weekIndex: number; targetDoseMg: number }>;
  /** האם המשתמש אישר את הסכמת ייעוץ רפואי לפני יצירת התוכנית */
  hasMedicalConsent: boolean;
  createdAt: string;
}
