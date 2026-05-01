---
name: refresh-player-photos
description: Telecharge ou rafraichit les photos des joueurs reels dans public/players/ via Wikipedia/Wikidata + fallback DiceBear initiales. A relancer quand de nouveaux joueurs sont ajoutes au seed ou quand un joueur monte au classement.
---

# Refresh Player Photos

## Quand l'utiliser

- Apres avoir ajoute un nouveau joueur dans [src/data/realPlayers.seed.ts](src/data/realPlayers.seed.ts)
- Quand un joueur a maintenant une page Wikipedia (avant il n'en avait pas, fallback DiceBear)
- Pour tout reset propre des photos (apres maj de l'API DiceBear, etc.)

## Commandes

```bash
# Mode increment : ne re-telecharge que les joueurs sans photo
npm run fetch:photos

# Mode force : retelecharge tout, ecrase l'existant
npm run fetch:photos:force
```

## Comment ca marche

Le script [scripts/fetch-player-photos.ts](scripts/fetch-player-photos.ts) :

1. **Wikipedia REST API** pour chaque joueur (cascade en/es/fr) → recupere `pageimages.thumbnail.source`
2. **Wikidata fallback** si Wikipedia ne trouve rien → recherche par nom, filtre par description "padel" pour eviter les faux positifs (ex: footballeur Tapia), recupere claim P18 (image)
3. **DiceBear fallback** si toujours rien → genere un avatar style "initials" avec un gradient adapte (palette differente H/F)
4. Pour chaque image : download, processing via `sharp` (crop carre centre + resize 320x320 + JPG quality 86 mozjpeg), sauve dans `public/players/{id}.jpg`
5. Logge dans [public/players/_attributions.json](public/players/_attributions.json) : source, URL, license, page Wikipedia (compliance CC BY-SA)
6. Genere aussi `public/players/_custom.jpg` (avatar par defaut pour les joueurs custom crees via Admin)

## Couverture attendue

- **~17/45 vraies photos** Wikipedia/Wikidata pour les top players (Coello, Tapia, Chingotto, Triay, Brea, Lebron, Galan, Stupaczuk, ...)
- **~28/45 fallback DiceBear** initiales coloriees (joueuses moins mediatisees, jeunes joueurs hors top 20)

## Compliance & licenses

- Photos Wikipedia/Wikimedia Commons : **CC BY-SA** — autorise l'usage commercial avec attribution
- Photos DiceBear (style initials) : **CC0** — pas d'attribution requise
- Pour respecter le CC BY-SA : afficher `_attributions.json` sur une page "Credits" si le projet est publie

## Troubleshooting

- **HTTP 429 sur Wikimedia** : rate limit, relancer apres 1 min ou reduire `BATCH_SIZE` dans le script
- **Mauvaise photo** (faux positif) : la photo recuperee n'est pas le bon joueur. Solution : ajouter un override manuel — copier la bonne photo dans `public/players/{id}.jpg` et le script la skipera (sauf `--force`)
- **Sharp install fails** : `npm rebuild sharp` resout les binaires natifs

## Ne pas committer (decision libre)

Le dossier `public/players/` peut etre committe (~1.4 MB total, 45 photos) ou ajoute a `.gitignore` selon preference. Recommandation : committer pour que le repo soit auto-suffisant et la build CI ne necessite pas de re-fetch.
