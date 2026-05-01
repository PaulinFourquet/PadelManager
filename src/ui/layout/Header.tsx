import { Menu, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useGameStore, type CareerView } from '@/store/gameStore';
import { cn } from '@/lib/utils';

const viewLabels: Record<CareerView, string> = {
  home: 'Accueil',
  playerSelect: 'Joueur',
  partnerSelect: 'Partenaire',
  calendar: 'Calendrier',
  match: 'Match',
  result: 'Resultat',
  admin: 'Admin',
  progression: 'Progression',
};

export const MobileMenu = () => {
  const view = useGameStore((state) => state.view);
  const setView = useGameStore((state) => state.setView);
  const resetCareer = useGameStore((state) => state.resetCareer);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>Padel Manager</SheetTitle>
          <SheetDescription>Navigation</SheetDescription>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-1">
          {(Object.keys(viewLabels) as CareerView[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={cn(
                'rounded-md px-3 py-2 text-left text-sm font-medium transition',
                view === item
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {viewLabels[item]}
            </button>
          ))}
        </nav>
        <Button variant="outline" size="sm" className="mt-6 w-full gap-2" onClick={resetCareer}>
          <RotateCcw className="h-3.5 w-3.5" />
          Nouvelle carriere
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export const TopBar = () => (
  <div className="flex items-center justify-between gap-3 border-b border-border bg-card/40 px-4 py-3 lg:hidden">
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <span className="text-sm font-bold">P</span>
      </div>
      <span className="text-sm font-semibold">Padel Manager</span>
    </div>
    <MobileMenu />
  </div>
);
