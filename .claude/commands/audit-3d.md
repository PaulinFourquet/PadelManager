---
description: Audit performance 3D — drawcalls, triangles, textures, FPS, bundle size
---

Audit complet de la perf 3D du jeu PadelManager.

Verifications :

1. **Bundle size**
   - `npm run build`
   - Lire le rapport rollup (chunk `three`)
   - Cible : chunk three < 6 MB

2. **Drawcalls + triangles** (manuel via DevTools)
   - Lancer `npm run dev` + `?demo3d=1`
   - Ouvrir DevTools > Performance Monitor
   - Cible : drawcalls < 80, triangles < 100k

3. **FPS**
   - Stats Overlay (drei `<Stats />` ou navigateur)
   - Cible phases 5-7 : ≥ 50 FPS sur GPU integre

4. **GLB sizes**
   - `ls -lh public/models/ public/animations/ public/hdri/ public/textures/`
   - Cible total : < 15 MB
   - Compresser avec gltfpack si excede

5. **Texture sizes**
   - Cible : 2K max pour court, 1K pour joueurs, 512 pour ball
   - Detection : check dimensions des fichiers .jpg/.png dans public/textures/

6. **Console errors**
   - Verifier 0 erreur GLB loading, 0 warning shader

Output :
```
Bundle three : X.X MB / 6 MB cible — [OK|WARN|FAIL]
Drawcalls : XX / 80 cible — [OK|WARN|FAIL]
Triangles : XX,XXX / 100k cible — [OK|WARN|FAIL]
FPS moyen : XX / 50 cible — [OK|WARN|FAIL]
Total assets : XX.X MB / 15 MB cible — [OK|WARN|FAIL]
Console errors : X — [OK|FAIL]
```

Si un seuil est depasse, proposer 1-2 optimisations concretes (ex : "court.glb est 2.4 MB, lancer gltfpack pour le ramener a ~800 KB").
