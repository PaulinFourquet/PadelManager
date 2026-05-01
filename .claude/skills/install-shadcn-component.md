---
name: install-shadcn-component
description: Workflow pour ajouter un composant shadcn au projet PadelManager — installe via CLI, verifie l'import alias @/, valide visuellement.
---

# Install shadcn component

## Pre-requis
- `components.json` existe a la racine
- Alias `@/` configure dans `tsconfig.json` + `vite.config.ts`
- Tokens HSL definis dans `src/styles.css`

## Workflow

1. **Identifier** le composant shadcn voulu (catalogue : https://ui.shadcn.com/docs/components)

2. **Installer** :
   ```bash
   cd C:/Users/fourq/Documents/PadelManager && npx shadcn@latest add <nom> --yes
   ```
   (utiliser `--overwrite` si on veut force la regeneration)

3. **Verifier** que le fichier est cree dans `src/components/ui/<nom>.tsx`

4. **Verifier** les peer dependencies installees (Radix primitives generalement)

5. **Importer** dans la page concernee :
   ```tsx
   import { Button } from '@/components/ui/button';
   ```

6. **Valider visuellement** :
   ```bash
   cd C:/Users/fourq/Documents/PadelManager && npm run dev
   ```
   Ouvrir http://127.0.0.1:5173 et verifier l'integration.

## Composants prioritaires PadelManager

### Phase 0 (deja installes)
button, card, tabs, badge, progress, avatar, tooltip, scroll-area, separator

### Phase 2 (UI hors-match)
- `dropdown-menu` — menu profil, actions admin
- `dialog` — confirmations (reset career, delete player)
- `sheet` — drawer mobile pour la sidebar
- `select` — selecteur tournoi, filtre joueurs
- `command` — palette recherche joueurs

### Phase 3 (UI match)
- `toggle-group` — controles tactiques + camera mode + playback speed
- `slider` — vitesse playback alternative
- `chart` — recharts wrapper si besoin de graphes evolution stats

### Phase 4+ (3D)
Pas de composants shadcn supplementaires — composants maison pour radar, gauge, etc.

## Style impose

Le projet utilise le style "new-york" de shadcn. Ne pas changer sans accord.
