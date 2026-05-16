import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { QuickLogFab } from './QuickLogFab';
import { Footer } from './Footer';
import { QuickLogModal } from '../quicklog/QuickLogModal';

/**
 * הפריסה הראשית של האפליקציה.
 * Mobile-first: TopBar למעלה, BottomNav למטה (במובייל), FAB מרחף.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 pb-32 pt-4 sm:pb-24">
        <Outlet />
      </main>

      <QuickLogFab />
      <BottomNav />
      <Footer />
      <QuickLogModal />
    </div>
  );
}
