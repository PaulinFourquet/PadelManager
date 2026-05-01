---
description: Synchronise les modeles Blender vers public/models et public/animations (refresh GLB exports)
---

Refresh les exports GLB depuis Blender vers le repo PadelManager.

Workflow :

1. Verifier que MCP Blender est connecte (sinon stopper et demander a Paulin de connecter via skill `setup-blender-mcp`)
2. Lister les modeles dans `public/models/` et `public/animations/`
3. Pour chaque GLB :
   - Verifier date de modification
   - Si une scene Blender (.blend) plus recente existe (verifier dans le workspace de Paulin), demander confirmation pour re-export
4. Re-exporter via MCP Blender en suivant les specs de `.claude/skills/generate-blender-model.md`
5. Lancer `npm run dev` et verifier que `?demo3d=1` charge sans erreur console
6. Optimiser si > 1MB : `npx gltfpack -i in.glb -o out.glb -cc`

Output : liste des fichiers re-exportes + tailles + status visuel apres rechargement.
