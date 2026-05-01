import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { Player } from '@/types';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PageHeader } from '@/ui/components/PageHeader';
import { PlayerCard } from '@/ui/components/PlayerCard';

type GenderFilter = 'all' | Player['gender'];

export const PlayerSelectPage = () => {
  const choosePlayer = useGameStore((state) => state.choosePlayer);
  const career = useGameStore((state) => state.career);
  const players = useGameStore((state) => state.players);

  return (
    <SelectionScreen
      eyebrow="Carriere"
      title="Choix du joueur"
      description="Selectionne le padelista que tu incarnes pour cette carriere."
      players={players}
      selectedId={career.playerId}
      onSelect={choosePlayer}
      actionLabel="Incarner"
    />
  );
};

type SelectionScreenProps = {
  eyebrow?: string;
  title: string;
  description: string;
  players: Player[];
  selectedId: string | null;
  onSelect: (playerId: string) => void;
  actionLabel: string;
};

export const SelectionScreen = ({
  eyebrow,
  title,
  description,
  players,
  selectedId,
  onSelect,
  actionLabel,
}: SelectionScreenProps) => {
  const [query, setQuery] = useState('');
  const [gender, setGender] = useState<GenderFilter>('all');

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return players
      .filter((player) => (gender === 'all' ? true : player.gender === gender))
      .filter((player) =>
        lower
          ? player.name.toLowerCase().includes(lower) || player.nationality.toLowerCase().includes(lower)
          : true,
      )
      .sort((a, b) => a.ranking - b.ranking);
  }, [gender, players, query]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <Card className="flex flex-col gap-3 p-4 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher par nom ou nationalite"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Genre</span>
          <ToggleGroup
            type="single"
            value={gender}
            onValueChange={(value) => setGender((value as GenderFilter) || 'all')}
            className="gap-1"
          >
            <ToggleGroupItem value="all" size="sm" className="px-3">Tous</ToggleGroupItem>
            <ToggleGroupItem value="male" size="sm" className="px-3">H</ToggleGroupItem>
            <ToggleGroupItem value="female" size="sm" className="px-3">F</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            selected={selectedId === player.id}
            onSelect={() => onSelect(player.id)}
            actionLabel={actionLabel}
          />
        ))}
        {filtered.length === 0 ? (
          <p className="col-span-full rounded-md border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
            Aucun joueur ne correspond a tes filtres.
          </p>
        ) : null}
      </div>
    </div>
  );
};
