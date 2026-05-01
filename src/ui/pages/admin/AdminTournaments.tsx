import { useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useGameStore } from '@/store/gameStore';
import type { Tournament, TournamentCategory } from '@/types';
import { cn } from '@/lib/utils';
import { AdminInput, AdminNumber, AdminSelect } from '@/ui/components/AdminFormControls';

const tournamentCategories: TournamentCategory[] = [
  'FIP Bronze',
  'FIP Silver',
  'FIP Gold',
  'Challenger',
  'P2',
  'P1',
  'Premier Padel',
];

export const AdminTournaments = () => {
  const tournaments = useGameStore((state) => state.tournaments);
  const players = useGameStore((state) => state.players);
  const selectedId = useGameStore((state) => state.selectedAdminTournamentId);
  const selectAdminTournament = useGameStore((state) => state.selectAdminTournament);
  const createTournament = useGameStore((state) => state.createTournament);
  const updateTournament = useGameStore((state) => state.updateTournament);
  const deleteTournament = useGameStore((state) => state.deleteTournament);
  const importTournaments = useGameStore((state) => state.importTournaments);
  const [importText, setImportText] = useState('');
  const selected = tournaments.find((tournament) => tournament.id === selectedId) ?? tournaments[0];

  return (
    <div className="grid gap-5 xl:grid-cols-[330px_1fr]">
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
          <CardTitle className="text-sm">Tournois ({tournaments.length})</CardTitle>
          <Button size="sm" onClick={createTournament} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Creer
          </Button>
        </CardHeader>
        <CardContent className="p-2">
          <ScrollArea className="h-[60vh] pr-2">
            <ul className="space-y-1.5">
              {tournaments.map((tournament) => (
                <li key={tournament.id}>
                  <button
                    type="button"
                    onClick={() => selectAdminTournament(tournament.id)}
                    className={cn(
                      'w-full rounded-md border p-2.5 text-left text-sm transition',
                      selected?.id === tournament.id
                        ? 'border-primary/60 bg-primary/10 text-foreground'
                        : 'border-border bg-background/30 text-foreground hover:bg-background/60',
                    )}
                  >
                    <span className="font-semibold">{tournament.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {tournament.category} · jour {tournament.startDay}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{selected?.name ?? 'Aucun tournoi selectionne'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selected ? (
            <div className="grid gap-3 md:grid-cols-2">
              <AdminInput label="Nom" value={selected.name} onChange={(value) => updateTournament(selected.id, { name: value })} />
              <AdminSelect
                label="Categorie"
                value={selected.category}
                options={tournamentCategories}
                onChange={(value) => updateTournament(selected.id, { category: value as TournamentCategory })}
              />
              <AdminSelect
                label="Surface"
                value={selected.surface}
                options={['standard', 'fast', 'slow']}
                onChange={(value) => updateTournament(selected.id, { surface: value as Tournament['surface'] })}
              />
              <AdminNumber label="Jour" value={selected.startDay} onChange={(value) => updateTournament(selected.id, { startDay: value })} />
              <AdminNumber label="Dotation" value={selected.prizeMoney} onChange={(value) => updateTournament(selected.id, { prizeMoney: value })} />
              <AdminNumber
                label="Participants"
                value={selected.participantPairs}
                onChange={(value) => updateTournament(selected.id, { participantPairs: value })}
              />
              <AdminSelect
                label="Adversaire 1"
                value={selected.opponentPlayerIds[0]}
                options={players.map((player) => player.id)}
                onChange={(value) => updateTournament(selected.id, { opponentPlayerIds: [value, selected.opponentPlayerIds[1]] })}
              />
              <AdminSelect
                label="Adversaire 2"
                value={selected.opponentPlayerIds[1]}
                options={players.map((player) => player.id)}
                onChange={(value) => updateTournament(selected.id, { opponentPlayerIds: [selected.opponentPlayerIds[0], value] })}
              />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={() => setImportText(JSON.stringify(tournaments, null, 2))}>
              Exporter
            </Button>
            <Button size="sm" onClick={() => importTournaments(importText)} className="gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              Importer
            </Button>
            {selected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteTournament(selected.id)}
                className="gap-1.5 border-destructive/40 text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </Button>
            ) : null}
          </div>

          <Textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            className="min-h-28 font-mono text-xs"
          />
        </CardContent>
      </Card>
    </div>
  );
};
