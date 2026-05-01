---
name: setup-blender-mcp
description: Pas-a-pas pour installer le MCP Blender (cote Paulin) — connector officiel Anthropic ou installation manuelle ahujasid/blender-mcp. Utilisable avant la phase 4 (modeles GLB).
---

# Setup Blender MCP

Le MCP Blender permet de piloter Blender depuis Claude Code pour creer/modifier les modeles 3D du jeu.

## Option A : Connector officiel Anthropic (recommande)

1. Ouvrir Claude Desktop
2. Settings > Connectors
3. Activer "Blender" dans la liste
4. Suivre les instructions pour lier Blender (peut demander d'installer un addon dans Blender)
5. Verifier dans Claude Code en demandant "list available Blender tools"

## Option B : Installation manuelle (ahujasid/blender-mcp)

### Prerequis
- Blender ≥ 3.0 (3.6+ recommande)
- Python ≥ 3.10
- `uv` package manager

### Installer uv (Windows PowerShell)
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Telecharger l'addon
Telecharger `addon.py` depuis https://github.com/ahujasid/blender-mcp

### Activer dans Blender
1. Edit > Preferences > Add-ons > Install...
2. Selectionner `addon.py`
3. Activer "Interface: Blender MCP"

### Configurer Claude Desktop
Editer `claude_desktop_config.json` :
```json
{
  "mcpServers": {
    "blender": {
      "command": "uvx",
      "args": ["blender-mcp"]
    }
  }
}
```

### Connecter
Dans Blender 3D View > N (panel) > onglet BlenderMCP > "Connect to Claude"

## Verification

Dans Claude Code, demander : "Crée un cube simple dans Blender et exporte-le en GLB". Si Blender repond, le MCP est OK.

## Troubleshooting

- **MCP ne repond pas** : verifier que Blender est ouvert ET que "Connect to Claude" est cliqué
- **uvx introuvable** : reinstaller uv, redemarrer le terminal
- **Permission denied addon** : lancer Blender en admin une premiere fois pour installer l'addon

## Quand l'utiliser dans PadelManager

Le MCP devient critique a la phase 4 du plan (modeles GLB court + joueurs + raquettes + ball). Avant phase 4, le projet avance sans MCP. Si l'install bloque, fallback temporaire : modeles libres Quaternius (CC0), Sketchfab CC0, Kenney.
