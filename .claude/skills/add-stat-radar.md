---
name: add-stat-radar
description: Genere un composant radar SVG hexagonal pour afficher les 6 familles de stats joueur (attack, defense, technique, physical, mental, tactical). Utilise les tokens --radar-*.
---

# Add Stat Radar

Composant signature de l'UI PadelManager : radar hexagonal pour visualiser les stats d'un joueur.

## Specifications

- 6 axes : `attack`, `defense`, `technique`, `physical`, `mental`, `tactical`
- Plage : 0-100 (la valeur affichee = moyenne du sous-groupe via `Object.values(player.stats[family])`)
- SVG pur, pas de canvas
- Couleur de remplissage : selon equipe ou neutre, opacity 0.3
- Stroke : meme couleur, opacity 1, width 2
- Grille : 4 hexagones concentriques (25, 50, 75, 100), stroke `border` opacity 0.4
- Labels : nom de la famille + valeur, font-size 10, fill `muted-foreground`
- Tokens couleurs : `--radar-attack`, `--radar-defense`, etc. (definis dans `src/styles.css`)

## Squelette

```tsx
import { cn } from '@/lib/utils';
import type { PlayerStats } from '@/types';

type StatRadarProps = {
  stats: PlayerStats;
  size?: number;
  variant?: 'team-a' | 'team-b' | 'neutral';
  className?: string;
};

const families = ['attack', 'defense', 'technique', 'physical', 'mental', 'tactical'] as const;

const familyAverage = (group: Record<string, number>) => {
  const values = Object.values(group);
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
};

export const StatRadar = ({ stats, size = 240, variant = 'neutral', className }: StatRadarProps) => {
  const center = size / 2;
  const radius = size * 0.4;
  const values = families.map((family) => familyAverage(stats[family]));

  // Calcul polygones
  const points = values.map((value, i) => {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    const r = (value / 100) * radius;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  });

  // ... grille + axes + polygone + labels
};
```

## Couleurs par variant

- `team-a` : fill `hsl(var(--team-a) / 0.3)`, stroke `hsl(var(--team-a))`
- `team-b` : fill `hsl(var(--team-b) / 0.3)`, stroke `hsl(var(--team-b))`
- `neutral` : fill `hsl(var(--primary) / 0.25)`, stroke `hsl(var(--primary))`

## Animation

Sur mount : animer le polygone depuis le centre via SVG `<animate>` ou framer-motion (ne pas ajouter framer-motion si pas deja installe — preferer CSS transitions).

## Usage

```tsx
import { StatRadar } from '@/ui/components/StatRadar';
<StatRadar stats={player.stats} size={200} variant="team-a" />
```

Doit apparaitre dans : `PlayerCard`, `PlayerSelectPage`, `ResultPage` (comparaison vainqueur/vaincu), `ProgressionPage` (evolution apres training).
