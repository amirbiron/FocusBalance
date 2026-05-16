# FocusBalance 🎯

ממשק ווב לניהול והפחתה של מינון ריטלין — דשבורד ידידותי המיועד למפתחים ועובדי ידע.

> **לא כלי רפואי.** זה כלי מעקב אישי. כל החלטה על שינוי מינון חייבת להיעשות בהתייעצות עם הרופא המטפל.

המסמך המלא של האפיון נמצא ב-`docs/FocusBalance.md`.

## סטאק

- **Vite + React 18 + TypeScript**
- **Tailwind CSS 3** עם פלטה מותאמת (סגול עמוק, טורקיז, כתום חם)
- **Dexie.js** ל-IndexedDB — כל הנתונים נשמרים מקומית בדפדפן
- **Zustand** ל-state גלובלי, **React Router** לניווט
- **Recharts** לגרפים, **Lucide** לאייקונים
- מלא RTL + עברית (Heebo / Assistant)

## הפעלה

```bash
npm install
npm run dev      # פיתוח בכתובת http://localhost:5173
npm run build    # בנייה לפרודקשן
npm run typecheck
npm run lint
```

## מבנה תיקיות

```
src/
├── components/
│   └── layout/     # AppLayout, TopBar, BottomNav, FAB, Footer
├── db/
│   ├── schema.ts   # טיפוסי TypeScript לישויות
│   ├── database.ts # מופע Dexie
│   ├── seed.ts     # טריגרים ברירת-מחדל
│   └── repositories/
├── pages/          # מסכים ראשיים (Dashboard, Insights, Plan, Journal, Settings, Help)
├── store/          # Zustand stores
├── lib/            # utilities
└── styles/         # CSS גלובלי
```

## שלב פיתוח נוכחי

**שלב MVP בסיס** — תשתית, מודל נתונים, ניווט. הלוגיקה של המסכים תיבנה בסבבים הבאים:
1. ✅ תשתית פרויקט + Tailwind + RTL
2. ✅ Dexie schema + repositories + seed טריגרים
3. ✅ Layout + ניווט תחתון + FAB + 6 stubs
4. ⏳ מסך הגדרות + אונבורדינג + disclaimer
5. ⏳ Quick Log modal
6. ⏳ דשבורד עם נתונים אמיתיים
7. ⏳ יומן והיסטוריה
8. ⏳ תובנות (טריגרים)

## פרטיות

כל הנתונים נשמרים אך ורק ב-IndexedDB המקומי של הדפדפן. אין שליחה לשרת, אין tracking, אין צד ג'.
