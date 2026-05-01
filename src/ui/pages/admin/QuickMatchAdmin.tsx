import { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore } from '@/store/gameStore';
import { AdminSelect } from '@/ui/components/AdminFormControls';

export const QuickMatchAdmin = () => {
  const players = useGameStore((state) => state.players);
  const startQuickMatch = useGameStore((state) => state.startQuickMatch);
  const defaults = [players[0]?.id, players[1]?.id, players[2]?.id, players[3]?.id].filter(Boolean) as string[];
  const [ids, setIds] = useState<[string, string, string, string]>([
    defaults[0] ?? '',
    defaults[1] ?? '',
    defaults[2] ?? '',
    defaults[3] ?? '',
  ]);

  const set = (index: number, value: string) => {
    setIds((current) => current.map((id, idx) => (idx === index ? value : id)) as [string, string, string, string]);
  };

  const labels = ['Equipe A · joueur 1', 'Equipe A · joueur 2', 'Equipe B · joueur 1', 'Equipe B · joueur 2'];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Mode test rapide</CardTitle>
        <p className="text-sm text-muted-foreground">
          Lance un match 3D entre deux paires sans passer par la carriere.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {ids.map((id, index) => (
            <AdminSelect
              key={index}
              label={labels[index]}
              value={id}
              options={players.map((player) => player.id)}
              onChange={(value) => set(index, value)}
            />
          ))}
        </div>
        <Button onClick={() => startQuickMatch(ids)} className="gap-2">
          <PlayCircle className="h-4 w-4" />
          Lancer le match 3D
        </Button>
      </CardContent>
    </Card>
  );
};
