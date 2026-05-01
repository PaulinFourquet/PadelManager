import { useState } from 'react';
import { Copy, Plus, Trash2, Upload } from 'lucide-react';
import { realPlayerNotes } from '@/data/realPlayers.seed';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import { PlayerEditor } from '@/ui/pages/admin/PlayerEditor';

export const AdminPlayers = () => {
  const players = useGameStore((state) => state.players);
  const selectedId = useGameStore((state) => state.selectedAdminPlayerId);
  const selectAdminPlayer = useGameStore((state) => state.selectAdminPlayer);
  const createPlayer = useGameStore((state) => state.createPlayer);
  const duplicatePlayer = useGameStore((state) => state.duplicatePlayer);
  const deletePlayer = useGameStore((state) => state.deletePlayer);
  const importPlayers = useGameStore((state) => state.importPlayers);
  const resetPlayersSeed = useGameStore((state) => state.resetPlayersSeed);
  const [importText, setImportText] = useState('');
  const selected = players.find((player) => player.id === selectedId) ?? players[0];

  return (
    <div className="grid gap-5 xl:grid-cols-[330px_1fr]">
      <Card className="flex flex-col shadow-card">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
          <CardTitle className="text-sm">Joueurs ({players.length})</CardTitle>
          <Button size="sm" onClick={createPlayer} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Creer
          </Button>
        </CardHeader>
        <CardContent className="p-2">
          <ScrollArea className="h-[72vh] pr-2">
            <ul className="space-y-1.5">
              {players
                .slice()
                .sort((a, b) => a.gender.localeCompare(b.gender) || a.ranking - b.ranking)
                .map((player) => (
                  <li key={player.id}>
                    <button
                      type="button"
                      onClick={() => selectAdminPlayer(player.id)}
                      className={cn(
                        'w-full rounded-md border p-2.5 text-left text-sm transition',
                        selected?.id === player.id
                          ? 'border-primary/60 bg-primary/10 text-foreground'
                          : 'border-border bg-background/30 text-foreground hover:bg-background/60',
                      )}
                    >
                      <span className="text-xs text-muted-foreground tabular-nums">#{player.ranking}</span>{' '}
                      <span className="font-semibold">{player.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {player.gender} · {player.nationality} · {player.naturalStyle}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="space-y-5">
        {selected ? <PlayerEditor player={selected} /> : null}

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Import / Export JSON</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              placeholder="Colle ici un tableau JSON de joueurs"
              className="min-h-28 font-mono text-xs"
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setImportText(JSON.stringify(players, null, 2))}>
                Exporter
              </Button>
              <Button size="sm" onClick={() => importPlayers(importText)} className="gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Importer
              </Button>
              <Button variant="outline" size="sm" onClick={resetPlayersSeed} className="border-destructive/40 text-destructive">
                Reset seed
              </Button>
              {selected ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => duplicatePlayer(selected.id)} className="gap-1.5">
                    <Copy className="h-3.5 w-3.5" />
                    Dupliquer
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deletePlayer(selected.id)} className="gap-1.5 border-destructive/40 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </Button>
                </>
              ) : null}
            </div>
            <div className="rounded-md border border-border bg-background/40 p-3 text-xs text-muted-foreground">
              {realPlayerNotes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
