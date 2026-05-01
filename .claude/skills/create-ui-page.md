---
name: create-ui-page
description: Scaffold d'une nouvelle page UI dans PadelManager — module pages/, lien depuis App.tsx, structure FM dark, composants shadcn.
---

# Create UI page

## Convention
Une "page" PadelManager = un composant correspondant a une valeur de `CareerView` (`home | playerSelect | partnerSelect | calendar | match | result | admin | progression`). Affichee via le switch dans `App.tsx`.

## Structure cible

```
src/ui/pages/
  HomePage.tsx
  PlayerSelectPage.tsx
  PartnerSelectPage.tsx
  CalendarPage.tsx
  MatchPage.tsx
  ResultPage.tsx
  AdminPage.tsx
  ProgressionPage.tsx
```

## Squelette type

```tsx
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const HomePage = () => {
  const career = useGameStore((state) => state.career);

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Saison {career.season}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          Accueil
        </h1>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent>
            {/* contenu */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
```

## Regles

1. **Imports en `@/`** uniquement
2. **Tokens HSL** uniquement (pas de couleur hardcodee)
3. **Composants shadcn** d'abord, composants maison sinon
4. **Selecteurs Zustand** atomiques (un selecteur par champ pour minimiser re-renders) :
   ```tsx
   const career = useGameStore((s) => s.career);
   const players = useGameStore((s) => s.players); // au lieu d'un seul gros selecteur
   ```
5. **Animation entree** : `animate-fade-in` sur le wrapper top-level
6. **Header** : label uppercase muted + titre semibold tracking-tight
7. **Grilles** : `grid gap-4 md:grid-cols-2 xl:grid-cols-3` pour les listes de cartes

## Brancher dans App.tsx

```tsx
import { HomePage } from '@/ui/pages/HomePage';
// ...
{view === 'home' && <HomePage />}
```

## Test

```bash
cd C:/Users/fourq/Documents/PadelManager && npm run dev
```
Ouvrir http://127.0.0.1:5173, naviguer vers la page, verifier rendu.
