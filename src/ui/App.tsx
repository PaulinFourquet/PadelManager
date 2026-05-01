import { useGameStore } from '@/store/gameStore';
import { AppShell } from '@/ui/layout/AppShell';
import { useDemoBoot } from '@/ui/hooks/useDemoBoot';
import { HomePage } from '@/ui/pages/HomePage';
import { PlayerSelectPage } from '@/ui/pages/PlayerSelectPage';
import { PartnerSelectPage } from '@/ui/pages/PartnerSelectPage';
import { CalendarPage } from '@/ui/pages/CalendarPage';
import { MatchPage } from '@/ui/pages/MatchPage';
import { ResultPage } from '@/ui/pages/ResultPage';
import { AdminPage } from '@/ui/pages/AdminPage';
import { ProgressionPage } from '@/ui/pages/ProgressionPage';

export const App = () => {
  useDemoBoot();
  const view = useGameStore((state) => state.view);

  return (
    <AppShell>
      {view === 'home' && <HomePage />}
      {view === 'playerSelect' && <PlayerSelectPage />}
      {view === 'partnerSelect' && <PartnerSelectPage />}
      {view === 'calendar' && <CalendarPage />}
      {view === 'match' && <MatchPage />}
      {view === 'result' && <ResultPage />}
      {view === 'admin' && <AdminPage />}
      {view === 'progression' && <ProgressionPage />}
    </AppShell>
  );
};
