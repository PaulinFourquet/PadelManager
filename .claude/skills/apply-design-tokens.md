---
name: apply-design-tokens
description: Remplace les couleurs hardcodees (#1f6f45, bg-[#xxx], text-[#xxx]) par les tokens HSL du design system PadelManager. A utiliser pendant la refonte UI phases 2-3.
---

# Apply design tokens

## Probleme
Le code legacy (App.tsx 1205 LOC) utilise des couleurs hardcodees partout :
- `bg-[#eef4ef]`, `text-[#162119]`, `border-[#c6d4c9]`, `text-[#704328]`, etc.
- `bg-[#1f6f45]` (vert padel), `bg-[#b9432f]` (rouge equipe B)
- `text-[#53735d]`, `bg-[#dce6df]`, `bg-[#f7faf8]`...

## Solution
Mapper vers les tokens HSL definis dans `src/styles.css` :

| Hardcoded legacy | Token cible |
|---|---|
| `bg-[#eef4ef]`, `bg-[#f7faf8]` | `bg-background` ou `bg-card` |
| `text-[#162119]`, `text-[#26362b]` | `text-foreground` |
| `text-[#53735d]`, `text-[#66746b]` | `text-muted-foreground` |
| `border-[#c6d4c9]`, `border-[#dce6df]` | `border-border` |
| `bg-[#1f6f45]` (team A), `text-[#1f6f45]` | `bg-primary` ou `bg-team-a` |
| `bg-[#b9432f]` (team B) | `bg-team-b` |
| `text-[#704328]` (accent CTA) | `text-accent` ou `text-accent-foreground` |
| `bg-[#f1d46b]` (highlight) | `bg-accent` |

## Workflow

1. **Grep** les couleurs hardcodees :
   ```
   Grep pattern="\\[#[0-9a-fA-F]+\\]" type="tsx"
   ```
2. **Pour chaque match**, identifier le token cible (table ci-dessus)
3. **Edit** le fichier en remplacant la classe
4. Lancer `npm run dev` et verifier que la vue n'a pas regresse visuellement
5. Commit "refactor: replace hardcoded colors with design tokens in <fichier>"

## Garde-fou

- **Ne jamais** ajouter une nouvelle couleur hardcodee. Si le token n'existe pas, **ajouter** le token d'abord :
  1. Edit `src/styles.css` → ajouter `--xxx: H S% L%`
  2. Edit `tailwind.config.ts` → mapper `xxx: 'hsl(var(--xxx))'`
  3. Utiliser `bg-xxx` dans le composant

## Cas particuliers

- Couleurs purement visuelles 3D (court color, ball emissive) restent en hex litteral dans `src/3d/*` — ce ne sont pas des UI tokens, ce sont des materiaux Three.js. OK de les laisser.
- Couleurs d'equipe dans la 3D doivent matcher `--team-a` et `--team-b` (pour coherence avec UI). On peut lire les tokens via `getComputedStyle(document.documentElement).getPropertyValue('--team-a')` si besoin.
