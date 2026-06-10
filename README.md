# Portfolio — Roman Rodriguez

Site portfolio statique (React, sans framework de build) : [export/](export/)

## Structure

```
export/
├── index.html                      ← PRODUCTION (généré, ne pas éditer à la main)
├── Portfolio Roman Rodriguez.html  ← source / dev (compile le JSX via Babel)
├── portfolio-data.jsx              ← contenu FR/EN (textes, projets, expériences)
├── variation-soft-cool.jsx         ← composants React (mise en page, couleurs)
├── app.jsx                         ← point d'entrée (langue, scroll progress)
├── vendor/                         ← React production auto-hébergé
├── assets/                         ← images WebP, favicon, CV PDF
├── build-standalone.ps1            ← build : précompile le JSX → index.html
├── optimize-images.py              ← convertit les images en WebP redimensionné
└── generate-cv.py                  ← régénère assets/cv-roman-rodriguez.pdf
```

## Modifier le site

1. Éditer le contenu (`portfolio-data.jsx`) ou la mise en page (`variation-soft-cool.jsx`).
2. Prévisualiser : servir `export/` en HTTP et ouvrir `Portfolio Roman Rodriguez.html`
   (ex. `python -m http.server 8000` dans `export/`).
3. Rebuilder la prod : `powershell -File export/build-standalone.ps1`
   (nécessite Node ; esbuild est récupéré via `npx`).
4. Commit + push : `index.html` est la page servie en ligne.

## Ajouter une image

Déposer le fichier dans `export/assets/`, puis lancer `python export/optimize-images.py`
pour générer la version WebP optimisée, et référencer le `.webp` dans le JSX.

## Mettre à jour le CV

Remplacer `export/assets/cv-roman-rodriguez.pdf` (ou ajuster `generate-cv.py` et le relancer).

## Déploiement

Le site est 100 % statique et fonctionne même sous `file://`.
GitHub Pages : activer Pages sur la branche `main`, le site sera servi sur
`https://vaxen69.github.io/LePortofilio/export/`.
Si l'URL finale change, adapter `canonical`, `og:url`, `og:image` dans
`Portfolio Roman Rodriguez.html`, ainsi que `robots.txt` et `sitemap.xml`, puis rebuilder.
