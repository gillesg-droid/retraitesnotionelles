# Retraites, autrement

Site pédagogique présentant l’intégralité de la « Note interne — Doctrine retraites » sous une forme accessible : lecture rapide, schémas en HTML/CSS, laboratoire de paramètres, graphiques de fourchettes, risques et questions ouvertes.

## Principes éditoriaux

- aucune donnée externe n’est ajoutée au document source ;
- les valeurs fixées, trajectoires indicatives, options et hypothèses sont distinguées visuellement ;
- le laboratoire ne se présente jamais comme une simulation actuarielle individuelle ;
- les fourchettes budgétaires restent celles de la note et ne sont pas recalculées par les curseurs ;
- la page est utilisable au clavier, imprimable et adaptée aux petits écrans.

## Développement local

Prérequis : Node.js 22.13 ou supérieur.

```bash
npm ci
npm run dev
```

Le site est ensuite disponible sur `http://localhost:3000/`.

## Vérification

```bash
npm test
```

La commande construit l’export statique puis vérifie la présence des contenus essentiels, des métadonnées et de la carte sociale.

## Publication sur GitHub Pages

Le workflow `.github/workflows/deploy-pages.yml` construit et publie automatiquement le site à chaque envoi sur la branche `main`.

Dans les paramètres du dépôt GitHub, choisir :

1. **Settings → Pages** ;
2. **Source → GitHub Actions**.

Le chemin public du dépôt est automatiquement intégré aux ressources du site. Pour un domaine personnalisé, définir aussi `NEXT_PUBLIC_SITE_URL` dans l’environnement de construction afin d’obtenir des métadonnées sociales absolues correspondant au domaine final.

## Source doctrinale

Le document source reste à la racine du projet : `Note interne — Doctrine retraites.md`.

