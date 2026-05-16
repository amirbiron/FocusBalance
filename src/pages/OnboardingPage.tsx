import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WelcomeStep } from '@/components/onboarding/WelcomeStep';
import { DisclaimerStep } from '@/components/onboarding/DisclaimerStep';
import { ProfileStep } from '@/components/onboarding/ProfileStep';
import { upsertLocalUser, acceptDisclaimer } from '@/db/repositories/users';

type Step = 'welcome' | 'disclaimer' | 'profile';

/**
 * תהליך אונבורדינג בן 3 שלבים.
 * נדרש לפני כניסה לשאר האפליקציה (ראה route guard ב-App.tsx).
 */
export function OnboardingPage() {
  const [step, setStep] = useState<Step>('welcome');
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md card">
        {/* מחוון התקדמות */}
        <div className="mb-6 flex items-center gap-1.5">
          {(['welcome', 'disclaimer', 'profile'] as Step[]).map((s) => (
            <div
              key={s}
              className={
                step === s
                  ? 'h-1.5 flex-1 rounded-full bg-brand transition-all'
                  : 'h-1.5 flex-1 rounded-full bg-brand-100 transition-all'
              }
            />
          ))}
        </div>

        {step === 'welcome' && (
          <WelcomeStep onNext={() => setStep('disclaimer')} />
        )}

        {step === 'disclaimer' && (
          <DisclaimerStep
            onBack={() => setStep('welcome')}
            onAccept={() => setStep('profile')}
          />
        )}

        {step === 'profile' && (
          <ProfileStep
            onBack={() => setStep('disclaimer')}
            onSubmit={async (data) => {
              // קודם יוצרים את המשתמש (בלי disclaimer), אז מסמנים disclaimer.
              // הפרדה כדי שלא ייווצר משתמש "תקוע" אם acceptDisclaimer ייכשל.
              await upsertLocalUser({
                prescribedDailyDose: data.prescribedDailyDose,
                unitDoses: data.unitDoses,
                scheduledTimes: data.scheduledTimes,
                doctorName: data.doctorName,
                hasAcceptedDisclaimer: false,
              });
              await acceptDisclaimer();
              navigate('/', { replace: true });
            }}
          />
        )}
      </div>
    </div>
  );
}
