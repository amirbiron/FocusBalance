export function DashboardPage() {
  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="text-xl font-bold text-brand-700">היום שלך</h1>
        <p className="mt-2 text-slate-600">
          ברוך הבא ל-FocusBalance. כאן יוצגו המנות שלך להיום, רצף ימים ביעד, וגרף שבועי.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          (בקרוב — לאחר חיבור ל-DB ול-Quick Log)
        </p>
      </div>
    </div>
  );
}
