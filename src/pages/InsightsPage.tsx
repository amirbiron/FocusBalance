import { useState } from 'react';
import { TriggersTab } from '@/components/insights/TriggersTab';
import { ComingSoonTab } from '@/components/insights/ComingSoonTab';
import { cn } from '@/lib/utils';

type TabId = 'triggers' | 'time' | 'trend' | 'correlations';

interface TabDef {
  id: TabId;
  label: string;
}

const TABS: TabDef[] = [
  { id: 'triggers', label: 'טריגרים' },
  { id: 'time', label: 'דפוסי זמן' },
  { id: 'trend', label: 'מגמה' },
  { id: 'correlations', label: 'מתאמים' },
];

export function InsightsPage() {
  const [active, setActive] = useState<TabId>('triggers');

  return (
    <div className="space-y-4">
      {/* טאבים — overflow-x במובייל אם צר */}
      <div
        className="flex gap-1 overflow-x-auto rounded-2xl bg-brand-50/60 p-1 border border-brand-100"
        role="tablist"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              'shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition',
              active === tab.id
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-brand-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {active === 'triggers' && <TriggersTab />}
        {active === 'time' && (
          <ComingSoonTab
            title="דפוסי זמן"
            description="מפת חום של שעה×יום שתראה מתי המנות הנוספות מתרכזות, ותעזור לזהות שעות שיא במהלך השבוע."
          />
        )}
        {active === 'trend' && (
          <ComingSoonTab
            title="מגמה לאורך זמן"
            description="גרף קווי של ממוצע יומי לאורך שבועות וחודשים, עם השוואה ליעד ואבני דרך מסומנות."
          />
        )}
        {active === 'correlations' && (
          <ComingSoonTab
            title="מתאמים"
            description="כשתחבר נתוני שינה ומצב רוח, נציג מתאמים בסיסיים — למשל איך שינה קצרה משפיעה על הצריכה."
          />
        )}
      </div>
    </div>
  );
}
