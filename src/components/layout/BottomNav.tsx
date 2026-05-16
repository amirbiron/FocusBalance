import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Target, Calendar, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ITEMS: NavItem[] = [
  { to: '/', label: 'בית', icon: Home },
  { to: '/insights', label: 'תובנות', icon: BarChart3 },
  { to: '/plan', label: 'תוכנית', icon: Target },
  { to: '/journal', label: 'יומן', icon: Calendar },
  { to: '/settings', label: 'הגדרות', icon: Settings },
];

export function BottomNav() {
  return (
    <nav
      aria-label="ניווט ראשי"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-brand-100/60 bg-surface/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-3xl items-stretch justify-around">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-2 py-3 text-xs transition',
                  isActive
                    ? 'text-brand-700'
                    : 'text-slate-500 hover:text-brand-600'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      isActive && 'drop-shadow-[0_2px_4px_rgba(107,70,193,0.4)]'
                    )}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
