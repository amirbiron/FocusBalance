import { UserCog, ShieldCheck } from 'lucide-react';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { useLocalUser } from '@/hooks/useLocalUser';
import { upsertLocalUser } from '@/db/repositories/users';

export function SettingsPage() {
  const user = useLocalUser();

  if (user === undefined) {
    return <div className="card text-slate-500">טוען…</div>;
  }
  if (user === null) {
    // לא אמור לקרות בגלל ה-route guard, אבל ליתר ביטחון
    return <div className="card text-slate-500">פרופיל לא נמצא</div>;
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <UserCog className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-bold text-brand-700">פרופיל רפואי</h1>
        </div>
        <p className="text-sm text-slate-600">
          הנתונים נשמרים מקומית בדפדפן. שינוי כאן ישפיע על היעד היומי ועל כפתורי
          התיעוד המהיר.
        </p>

        <div className="pt-2">
          <ProfileForm
            user={user}
            onSave={async (data) => {
              await upsertLocalUser({
                prescribedDailyDose: data.prescribedDailyDose,
                unitDoses: data.unitDoses,
                scheduledTimes: data.scheduledTimes,
                doctorName: data.doctorName,
                hasAcceptedDisclaimer: user.hasAcceptedDisclaimer,
                activeReductionPlanId: user.activeReductionPlanId,
              });
            }}
          />
        </div>
      </div>

      <div className="card space-y-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-50 text-accent-700">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="font-bold text-brand-700">פרטיות ונתונים</h2>
        </div>
        <p className="text-sm text-slate-600">
          כל הנתונים שלך — מנות, טריגרים, תוכניות — נשמרים אך ורק ב-IndexedDB של
          הדפדפן שלך. אין שליחה לשרת, אין tracking, אין שיתוף לצד ג'.
        </p>
        <p className="text-xs text-slate-500">
          בקרוב: יצוא נתונים (JSON / CSV / PDF) ומחיקה מלאה.
        </p>
      </div>
    </div>
  );
}
