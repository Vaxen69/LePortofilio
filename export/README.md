# Portfolio — Roman Rodriguez

## Contenu
- `Portfolio Roman Rodriguez.html` — fichier principal
- `portfolio-data.jsx` — contenu (FR/EN, projets, expériences…)
- `variation-soft-cool.jsx` — composants React du site
- `assets/` — logos, captures d'écran, photos

## Ouvrir le site

Le site utilise React via Babel et **doit être servi par un serveur HTTP** (un double-clic sur le .html ne suffira pas — les navigateurs bloquent les imports JSX en `file://`).

### Option 1 — Mini serveur local (Python, déjà installé sur Mac/Linux)
Dans le dossier, ouvre un terminal et tape :
```
python3 -m http.server 8000
```
Puis ouvre [http://localhost:8000/Portfolio%20Roman%20Rodriguez.html](http://localhost:8000/Portfolio%20Roman%20Rodriguez.html)

### Option 2 — VS Code + Live Server
Installe l'extension *Live Server*, fais clic-droit sur le fichier `.html` → *Open with Live Server*.

### Option 3 — Mise en ligne
Glisse-dépose le dossier sur [Netlify Drop](https://app.netlify.com/drop) ou pousse sur GitHub + active GitHub Pages. Le site est statique, aucune config nécessaire.

## Modifier le contenu
- Pour changer le texte : édite `portfolio-data.jsx`
- Pour changer la mise en page / les couleurs : édite `variation-soft-cool.jsx`
- Pour changer une image : remplace le fichier dans `assets/` (garde le même nom)
