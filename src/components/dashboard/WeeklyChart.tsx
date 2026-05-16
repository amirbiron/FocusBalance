import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { getRecentDays } from '@/db/repositories/doses';
import { aggregateByDay, buildWeeklySeries } from '@/lib/doseHelpers';
import type { User } from '@/db/schema';

interface Props {
  user: User;
}

/**
 * בר-צ'ארט שבועי של 7 ימים אחרונים, עם קו אופקי = יעד יומי.
 * Recharts תומך RTL טוב — לא צריך התאמות מיוחדות לציר ה-X.
 */
export function WeeklyChart({ user }: Props) {
  const events = useLiveQuery(() => getRecentDays(7), [], []);
  const byDay = aggregateByDay(events);
  const data = buildWeeklySeries(byDay);

  const maxY = Math.max(
    user.prescribedDailyDose,
    ...data.map((d) => d.totalMg),
    10
  );

  // צבע עמודה לפי היחס ליעד
  const colorFor = (mg: number): string => {
    if (mg === 0) return '#E8E0F5'; // brand-100
    if (mg <= user.prescribedDailyDose) return '#0D9488'; // accent
    if (mg <= user.prescribedDailyDose * 1.25) return '#D97706'; // warning
    return '#EA580C'; // warm
  };

  return (
    <Link
      to="/insights"
      className="card block hover:shadow-soft-lg transition cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="font-bold text-brand-700">7 ימים אחרונים</h2>
        </div>
        <span className="text-xs text-slate-500">לחץ לתובנות</span>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0F5" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#94A3B8"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              reversed
            />
            <YAxis
              stroke="#94A3B8"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, Math.ceil(maxY * 1.1)]}
              width={28}
              orientation="right"
            />
            <Tooltip
              cursor={{ fill: 'rgba(107, 70, 193, 0.06)' }}
              contentStyle={{
                background: 'white',
                border: '1px solid #E8E0F5',
                borderRadius: 12,
                fontSize: 12,
                direction: 'rtl',
              }}
              formatter={(value: number) => [`${value} מ"ג`, 'סה"כ']}
              labelFormatter={(label) => `יום ${label}`}
            />
            <ReferenceLine
              y={user.prescribedDailyDose}
              stroke="#6B46C1"
              strokeDasharray="4 4"
              label={{
                value: 'יעד',
                position: 'insideTopRight',
                fill: '#6B46C1',
                fontSize: 11,
              }}
            />
            <Bar dataKey="totalMg" radius={[8, 8, 0, 0]} maxBarSize={32}>
              {data.map((d) => (
                <Cell key={d.dateKey} fill={colorFor(d.totalMg)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Link>
  );
}
