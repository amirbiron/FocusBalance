import { TodayCard } from '@/components/dashboard/TodayCard';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { useLocalUser } from '@/hooks/useLocalUser';

export function DashboardPage() {
  const user = useLocalUser();

  if (!user) {
    return <div className="card text-slate-500">טוען…</div>;
  }

  return (
    <div className="space-y-4">
      <TodayCard user={user} />
      <StreakCard user={user} />
      <WeeklyChart user={user} />
      <InsightCard user={user} />
    </div>
  );
}
