---
description: Scaffold une nouvelle page UI PadelManager (module pages/, branchement App.tsx, smoke test)
argument-hint: <nom-page> (ex: TransfersPage, StatsHubPage)
---

Scaffold une nouvelle page UI PadelManager nommee `$ARGUMENTS`.

Suivre le skill `.claude/skills/create-ui-page.md` :

1. Creer `src/ui/pages/$ARGUMENTS.tsx` avec le squelette type (header label uppercase + titre + grille de Cards shadcn, animation `animate-fade-in`)
2. Si la page correspond a une nouvelle valeur de `CareerView`, ajouter dans `src/store/gameStore.ts` (consulter avant)
3. Ajouter le routage dans `src/ui/App.tsx` : `{view === '<key>' && <$ARGUMENTS />}`
4. Ajouter le label dans `viewLabels` si necessaire
5. Lancer `npm run dev` et naviguer vers la page

Regles :
- Imports `@/` uniquement
- Tokens HSL uniquement (pas de couleur hardcodee)
- shadcn d'abord (Card, Button, Tabs...), composants maison (`src/ui/components/`) sinon
- Selecteurs Zustand atomiques
- ≤ 250 LOC
