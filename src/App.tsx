import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { InsightsPage } from './pages/InsightsPage';
import { PlanPage } from './pages/PlanPage';
import { JournalPage } from './pages/JournalPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { seedIfNeeded } from './db/seed';
import { useLocalUser } from './hooks/useLocalUser';

/**
 * Guard שמכריח אונבורדינג לפני כניסה לאפליקציה.
 * אם אין משתמש או שלא אישר disclaimer — מפנה ל-/onboarding.
 */
function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const user = useLocalUser();
  const location = useLocation();

  // עוד טוען מ-IndexedDB — נציג מסך ביניים
  if (user === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-slate-500">
        טוען…
      </div>
    );
  }
  if (user === null || !user.hasAcceptedDisclaimer) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}

/** הפוך — אם כבר יש משתמש, אל תכנס לאונבורדינג שוב */
function RedirectIfOnboarded({ children }: { children: React.ReactNode }) {
  const user = useLocalUser();
  if (user === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-slate-500">
        טוען…
      </div>
    );
  }
  if (user && user.hasAcceptedDisclaimer) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    seedIfNeeded()
      .catch((err) => {
        console.error('כשל ב-seed של מסד הנתונים', err);
      })
      .finally(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-slate-500">
        טוען…
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/onboarding"
        element={
          <RedirectIfOnboarded>
            <OnboardingPage />
          </RedirectIfOnboarded>
        }
      />
      <Route
        element={
          <RequireOnboarding>
            <AppLayout />
          </RequireOnboarding>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
