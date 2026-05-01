---
name: generate-blender-model
description: Workflow pour generer un modele 3D dans Blender via MCP et l'exporter en GLB pret a integrer dans react-three-fiber. Phase 4 du plan PadelManager.
---

# Generate Blender Model

A utiliser en phase 4 du plan (modeles GLB).

## Pre-requis
- MCP Blender connecte (skill `setup-blender-mcp`)
- Blender ouvert avec l'addon BlenderMCP en mode "Connect to Claude"

## Modeles a produire

| Fichier | Description | Tris cible |
|---|---|---|
| `public/models/court.glb` | Terrain 10×20m + lignes + filet + vitres + grillage | < 5k |
| `public/models/player_male.glb` | Humanoid masculin riggé Mixamo, T-pose, tenue padel | ~5k |
| `public/models/player_female.glb` | Humanoid feminin riggé Mixamo, T-pose, tenue padel | ~5k |
| `public/models/racket.glb` | Raquette de padel (forme "ovale", grip + cordage) | < 1k |
| `public/models/ball.glb` | Balle subdivisee + normal map feutrage | < 500 |

## Specifications

### Court
- Plan 10×20m subdivise (5×5 m subdivisions pour deformation potentielle)
- 7 lignes blanches (4 baselines + 2 service lines + 1 center) en geometry separate
- Filet : maille reelle via modifier displace + boxes pour les poteaux (acier brosse)
- 4 vitres : MeshPhysicalMaterial transparent, IOR 1.5, roughness 0.05
- Grillage : wire geometry sur les cotes hauts
- Texture sol : 3 variantes selon `MatchOptions.surface` (standard / fast / slow) — bake les materiaux PBR depuis Blender

### Joueurs
- Base mesh humanoid (5k tris cible)
- Riggé via Mixamo Auto-Rigger (drag & drop le mesh sur mixamo.com puis re-import dans Blender)
- Tenue : short + polo + chaussures
- Couleur polo en vertex colors (ou material slot separe) → swappable runtime via uniform pour `--team-a` / `--team-b`
- Visage simple (pas de shape keys)
- Armature : skeleton standard Mixamo (compatibilite animations)

### Raquette
- Forme caracteristique padel (cadre solide perfore, pas tennis)
- Grip + cordage low-poly
- Decal logo optionnel
- A attacher en runtime au socket "RightHand" du skeleton joueur

### Balle
- Sphere subdivisee (UV sphere ico 2 ou 3)
- Normal map feutrage : procedural Blender (Voronoi noise + bump) → bake en texture
- Couleur : jaune fluo (#d8f168)

## Export GLB

Format : glTF 2.0 Binary
Options :
- Include : Selected Objects
- Geometry : Apply modifiers
- Animation : All Actions (uniquement pour anim-only)
- Mesh : Triangulate before export
- Materials : Export
- Y-up forward -Z (coherent r3f)

## Workflow type (via MCP Blender)

```
1. Demander a Claude :
   "Cree dans Blender une raquette de padel low-poly (~800 tris), grip texture noire, cadre couleur primary du jeu, exporte en GLB dans public/models/racket.glb"

2. L'agent 3d-artist pilote :
   - File > New (clean scene)
   - Mesh > primitive base (cylinder pour grip, plane subdivise pour cadre)
   - Modifier les meshes (extrude, bevel, perforations via boolean)
   - Material > nouveau Principled BSDF (couleur primary)
   - Export > glTF 2.0 (Binary)

3. Verifier le fichier :
   - Taille attendue 50-200 KB
   - Open dans https://gltf-viewer.donmccurdy.com pour verification visuelle
```

## Integration r3f

```tsx
import { useGLTF, Clone } from '@react-three/drei';

useGLTF.preload('/models/racket.glb');

const Racket = () => {
  const { scene } = useGLTF('/models/racket.glb');
  return <Clone object={scene} />;
};
```

## Checklist qualite

- [ ] Tris dans la cible (verifier dans Blender > Statistics overlay)
- [ ] Pas de N-gons (Edit Mode > Select > All by Trait > Faces by Sides > 5+)
- [ ] UVs unwrappes (sinon textures distordues)
- [ ] Origin centre (Object > Set Origin > Center of Geometry)
- [ ] Scale appliquee (Object > Apply > Scale)
- [ ] Pas de history modifier non-applique
- [ ] GLB s'ouvre sans erreur dans gltf-viewer

## Troubleshooting

- **GLB trop gros (>1MB)** : compresser via gltfpack (`npx gltfpack -i in.glb -o out.glb -cc`)
- **Couleurs delavees** : verifier color space sRGB sur les textures, Linear sur les normals
- **Animation pas exportee** : verifier que l'armature est selectionnee et que "All Actions" est coche
