---
name: sync-mixamo-animation
description: Workflow pour ajouter une animation Mixamo a PadelManager — download FBX, convertir en GLB anim-only via Blender MCP, integrer dans la state machine joueur.
---

# Sync Mixamo Animation

A utiliser en phase 5 du plan (animations joueurs).

## Pre-requis
- Compte Adobe Mixamo (gratuit) : https://www.mixamo.com
- MCP Blender configure (voir skill `setup-blender-mcp`)
- Modeles `player_male.glb` et `player_female.glb` deja dans `public/models/`

## Liste des animations cibles

| Nom fichier | Mixamo search query | Etat machine |
|---|---|---|
| `idle.glb` | "Idle" | `idle` |
| `running.glb` | "Running" | `moving` |
| `serve.glb` | "Tennis Serve" | `serving` |
| `smash.glb` | "Tennis Smash" ou "Baseball Swing" | `smashing` |
| `hit_forehand.glb` | "Tennis Forehand" | `hitting_forehand` |
| `hit_backhand.glb` | "Tennis Backhand" | `hitting_backhand` |
| `celebrate.glb` | "Victory" ou "Fist Pump" | `celebrating` |

## Workflow par animation

### 1. Download FBX
1. Mixamo > rechercher l'animation
2. Selectionner > "Without Skin" pour anim-only
3. Format : FBX Binary (.fbx)
4. FPS : 30 (default)
5. Download

### 2. Convertir en GLB via Blender MCP
1. Demander a Claude (avec MCP Blender connecte) :
   ```
   Importe l'FBX qui est dans Downloads/<nom>.fbx, attache-le au skeleton de public/models/player_male.glb, et exporte en GLB anim-only dans public/animations/<nom>.glb
   ```
2. L'agent 3d-artist pilote Blender :
   - File > Import > FBX (avec "Animation" check, "Armature" check)
   - Append le squelette du player_male
   - Verifier que l'animation est bien sur le bon armature
   - File > Export > glTF 2.0
     - Format : GLB Binary
     - Include : Selected Objects
     - Animation : All Actions
     - Mesh : decocher (anim-only)
     - Export

### 3. Verifier le GLB
```bash
ls -lh public/animations/
```
Taille attendue : 50-200 KB pour une animation courte.

### 4. Integrer dans la state machine

Edit `src/3d/animation/useAnimationClips.ts` :
```ts
const clipsToLoad = [
  { name: 'idle', url: '/animations/idle.glb' },
  { name: 'running', url: '/animations/running.glb' },
  // ...
];
```

### 5. Tester
```bash
npm run dev
```
Ouvrir `?demo3d=1` et verifier que le joueur fait l'animation au bon moment.

## Troubleshooting

- **Squelette ne match pas** : Mixamo utilise un naming `mixamorig:` pour les bones. Le player_male.glb doit avoir le meme rig (Mixamo Auto-Rigger applique avant export).
- **Animation trop rapide/lente** : verifier FPS 30 a l'export Mixamo. Sinon retiming dans Blender (Action Editor > scale frames).
- **Animation se bloque a la fin** : verifier `loop` flag dans `AnimationAction` cote react-three-fiber.

## Animations alternatives (si Mixamo insuffisant)

- Quaternius Universal Animation Library (CC0) : https://quaternius.com/
- mesh2motion.org pour autorigging
- CMU mocap database (gratuit)
