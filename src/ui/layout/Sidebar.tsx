import {
  BarChart3,
  CalendarDays,
  Home,
  RotateCcw,
  ScrollText,
  Trophy,
  User,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useGameStore, type CareerView } from '@/store/gameStore';
import { CareerStatusPanel } from '@/ui/layout/CareerStatusPanel';

type NavItem = {
  view: CareerView;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { view: 'home', label: 'Accueil', icon: Home },
  { view: 'playerSelect', label: 'Joueur', icon: User },
  { view: 'partnerSelect', label: 'Partenaire', icon: Users },
  { view: 'calendar', label: 'Calendrier', icon: CalendarDays },
  { view: 'match', label: 'Match', icon: Zap },
  { view: 'result', label: 'Resultat', icon: ScrollText },
  { view: 'progression', label: 'Progression', icon: BarChart3 },
  { view: 'admin', label: 'Admin', icon: Wrench },
];

export const Sidebar = () => {
  const view = useGameStore((state) => state.view);
  const setView = useGameStore((state) => state.setView);
  const resetCareer = useGameStore((state) => state.resetCareer);

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow">
          <Trophy className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Manager</p>
          <p className="text-sm font-semibold text-foreground">Padel Manager</p>
        </div>
      </div>

      <Separator />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = view === item.view;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => setView(item.view)}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                active
                  ? 'bg-primary/10 text-primary shadow-[inset_2px_0_0_hsl(var(--primary))]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={active ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <Separator />

      <div className="space-y-3 px-3 py-4">
        <CareerStatusPanel />
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={resetCareer}>
          <RotateCcw className="h-3.5 w-3.5" />
          Nouvelle carriere
        </Button>
      </div>
    </aside>
  );
};
