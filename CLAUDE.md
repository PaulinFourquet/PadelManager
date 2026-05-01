# PadelManager — Guide Claude

Jeu web de manager de padel (équivalent Football Manager pour le padel). Logique fonctionnelle générée par Codex/GPT-5.5, refonte UI/3D conduite avec Claude Code.

## Architecture en 1 paragraphe

React 19 + Vite 6 + TypeScript strict. State global via **Zustand + Immer** persisté en `localStorage` (3 clés : players, tournaments, events). Rendu 3D du match via **Three.js + react-three-fiber + drei**. Moteur de match (`src/engine/`) en TS pur, déterministe (RNG seedé), couvert par **Vitest**. UI stylée via **Tailwind v3 + shadcn/ui** (composants copiés dans `src/components/ui/`), tokens HSL dans [src/styles.css](src/styles.css). Pas de backend — tout est local au navigateur.

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur Vite sur http://127.0.0.1:5173 |
| `npm run build` | Type-check `tsc -b` puis build Vite |
| `npm run test` | Vitest headless (obligatoire avant tout commit touchant `src/engine/`) |
| `npm run test:watch` | Vitest watch mode |
| `npm run demo:cli` | Simulation match headless (debug moteur) |
| `npm run fetch:photos` | Telecharge les photos joueurs depuis Wikipedia/Wikidata + DiceBear fallback dans `public/players/` (voir [.claude/skills/refresh-player-photos.md](.claude/skills/refresh-player-photos.md)) |

**Query strings utiles** : `?demo3d=1` (auto-boot match Coello/Tapia), `?admin=1`, `?progression=1`.

## Conventions de code

- Composants `.tsx` PascalCase (`PlayerCard.tsx`), un composant par fichier
- Hooks `useFoo.ts` camelCase, dans `src/ui/hooks/`
- Types domain dans [src/types/domain.ts](src/types/domain.ts)
- **Imports absolus via `@/`** (ex : `import { Button } from '@/components/ui/button'`)
- Pas de barrel `index.ts` (imports directs des fichiers)
- Fonctions pures dans `src/engine/`, side effects dans `src/store/`
- Tailwind utility-first, jamais de CSS custom hors `src/styles.css` (sauf justification documentée)
- Pas d'emoji dans le code
- Pas de commentaire qui décrit le quoi (le nom de la fonction suffit) — uniquement le pourquoi quand non-évident
- Cibler ≤ 250 LOC par fichier UI (sinon découper)

## Zones interdites / fragiles

- **`src/engine/*`** — moteur de match, scoring, career. Couvert par tests Vitest. Lecture seule sauf demande explicite. Toujours `npm run test` avant commit qui touche ce dossier.
- **`src/3d/trajectory.ts`** (renommé `src/3d/physics/BallTrajectory.ts` en phase 6) — couvert par `trajectory.test.ts`.
- **`src/types/domain.ts`** — toute modification casse 10+ fichiers consommateurs. Ajouter de nouveaux types plutôt que modifier les existants.
- **`tsconfig.json`, `vite.config.ts`** — alias `@/` configuré, ne pas casser.

## Structure `.claude/`

- **`.claude/agents/`** — sous-agents spécialisés (ui-designer, 3d-artist, match-engine-guardian, refactor-architect)
- **`.claude/skills/`** — workflows réutilisables (setup-blender-mcp, install-shadcn-component, create-ui-page, generate-blender-model, sync-mixamo-animation, apply-design-tokens)
- **`.claude/commands/`** — slash commands (`/add-screen`, `/sync-blender`, `/audit-3d`)
- **`.claude/plans/`** — plans d'exécution validés (source de vérité pour la roadmap)

## Roadmap (7 phases incrémentales)

| Phase | Objet | État |
|---|---|---|
| 0 | Outillage : alias `@/`, shadcn, design tokens, structure `.claude/` | en cours |
| 1 | Découpage `App.tsx` (1205 LOC) + design system | à venir |
| 2 | Refonte UI hors-match (home, players, calendar, progression, admin) | à venir |
| 3 | Refonte UI match center (sans toucher la 3D) | à venir |
| 4 | Modèles Blender → GLB (court, joueurs, raquettes, ball) | à venir |
| 5 | Animations Mixamo + state machine joueurs | à venir |
| 6 | Physique balle réaliste (parabole + rebonds vitres) | à venir |
| 7 | Post-processing + ambiance stade (HDR, SSAO, bloom, audio) | à venir |

Plan détaillé : `C:\Users\fourq\.claude\plans\avec-le-dernier-mod-le-streamed-quill.md`

## Stack figée

- React 19 + Vite 6 + TS strict
- Zustand 5 + Immer
- Three.js 0.174 + @react-three/fiber 9 + @react-three/drei 10
- Tailwind 3.4 + shadcn/ui (style "new-york") + Lucide
- Inter Variable (via `@fontsource-variable/inter`)
- Vitest

## Définition "fait" pour une phase

1. `npm run build` passe (TS strict + bundle OK)
2. `npm run test` vert
3. `npm run dev` + `?demo3d=1` affiche un match jouable de bout en bout
4. Smoke test manuel des autres écrans (home, players, calendar, progression, admin)
5. Commit avec message clair décrivant le périmètre de la phase
