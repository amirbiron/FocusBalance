import { useState } from 'react';
import { MonthCalendar } from '@/components/journal/MonthCalendar';
import { DayDetailCard } from '@/components/journal/DayDetailCard';
import { useLocalUser } from '@/hooks/useLocalUser';
import { localDateKey } from '@/lib/doseHelpers';

export function JournalPage() {
  const user = useLocalUser();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(
    localDateKey(today)
  );

  if (!user) {
    return <div className="card text-slate-500">טוען…</div>;
  }

  const handlePrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const handleNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  return (
    <div className="space-y-4">
      <MonthCalendar
        year={year}
        month={month}
        selectedDateKey={selectedDateKey}
        targetMg={user.prescribedDailyDose}
        onSelectDay={setSelectedDateKey}
        onPrevMonth={handlePrev}
        onNextMonth={handleNext}
      />
      <DayDetailCard dateKey={selectedDateKey} targetMg={user.prescribedDailyDose} />
    </div>
  );
}
