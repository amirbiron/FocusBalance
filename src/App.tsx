import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { InsightsPage } from './pages/InsightsPage';
import { PlanPage } from './pages/PlanPage';
import { JournalPage } from './pages/JournalPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { seedIfNeeded } from './db/seed';

export default function App() {
  // טוען את הטריגרים ברירת-המחדל פעם אחת בהתקנה ראשונה
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
      <Route element={<AppLayout />}>
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
