import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore } from '@/store/gameStore';
import type { Player } from '@/types';
import { AdminInput, AdminNumber, AdminSelect } from '@/ui/components/AdminFormControls';
import { StatRadar } from '@/ui/components/StatRadar';
import { statFamilies } from '@/ui/lib/playerStats';

type PlayerEditorProps = {
  player: Player;
};

export const PlayerEditor = ({ player }: PlayerEditorProps) => {
  const updatePlayer = useGameStore((state) => state.updatePlayer);
  const updatePlayerStat = useGameStore((state) => state.updatePlayerStat);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Edition joueur</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="grid gap-3 md:grid-cols-3">
            <AdminInput label="Nom" value={player.name} onChange={(value) => updatePlayer(player.id, { name: value })} />
            <AdminInput label="Nationalite" value={player.nationality} onChange={(value) => updatePlayer(player.id, { nationality: value })} />
            <AdminNumber label="Age" value={player.age} onChange={(value) => updatePlayer(player.id, { age: value })} />
            <AdminNumber label="Taille cm" value={player.heightCm} onChange={(value) => updatePlayer(player.id, { heightCm: value })} />
            <AdminNumber label="Ranking" value={player.ranking} onChange={(value) => updatePlayer(player.id, { ranking: value })} />
            <AdminNumber label="Points" value={player.rankingPoints} onChange={(value) => updatePlayer(player.id, { rankingPoints: value })} />
            <AdminSelect
              label="Genre"
              value={player.gender}
              options={['male', 'female']}
              onChange={(value) => updatePlayer(player.id, { gender: value as Player['gender'] })}
            />
            <AdminSelect
              label="Cote"
              value={player.preferredSide}
              options={['drive', 'revers']}
              onChange={(value) => updatePlayer(player.id, { preferredSide: value as Player['preferredSide'] })}
            />
            <AdminSelect
              label="Main"
              value={player.dominantHand}
              options={['right', 'left']}
              onChange={(value) => updatePlayer(player.id, { dominantHand: value as Player['dominantHand'] })}
            />
            <AdminSelect
              label="Style"
              value={player.naturalStyle}
              options={['offensive', 'balanced', 'defensive', 'counter']}
              onChange={(value) => updatePlayer(player.id, { naturalStyle: value as Player['naturalStyle'] })}
            />
          </div>
          <StatRadar player={player} variant="neutral" size={200} />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {statFamilies.map((family) => (
            <div key={family} className="rounded-md border border-border bg-background/40 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{family}</h4>
              <div className="mt-3 space-y-3">
                {(Object.keys(player.stats[family]) as Array<keyof typeof player.stats[typeof family]>).map((key) => (
                  <label key={String(key)} className="grid gap-1 text-sm">
                    <span className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{String(key)}</span>
                      <span className="tabular-nums font-semibold text-foreground">{player.stats[family][key]}</span>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={player.stats[family][key]}
                      onChange={(event) => updatePlayerStat(player.id, family, key, Number(event.target.value))}
                      className="accent-primary"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
