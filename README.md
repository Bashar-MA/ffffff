# Figure Tools

A small, no-dependency, multi-page site for building publication-style scientific figures by hand. Everything runs in the browser.

- **`index.html`** — home page linking to all tools.
- **`timeline.html`** — study/trial timeline diagrams: scale, break, highlight regions, vertical markers.
- **`domains.html`** — protein domain / structure organization maps: residue ranges, per-domain height/fill/outline/dash, label position & orientation, a 40-color click-to-pick palette (or type a number 1–40, now standard hex colors so they display correctly in Adobe Illustrator), adjustable label spacing, font controls, and a manual plot width/height in cm/mm/in.
- **`plots.html`** — Violin / Density / Line plots in one tool (tabs at the top switch chart type): paste CSV/TSV or upload a CSV/Excel file, one-click sample data, a "Show in plot" checkbox per column so you can include/exclude variables, per-series legend labels and colors (same 40-color hex palette), separate tick/interval counts for X and Y axes, a manual plot width/height in cm/mm/in, a positionable violin legend (25–75% box / 1.5×IQR range / Mean, stacked or in a row, with adjustable spacing), independently-sized and colored fonts for tick numbers/axis titles/legend text, colored background region annotations on line plots with an auto-built legend, and export to SVG or to PDF at a chosen DPI (300 and up).
- **`shared.js`** — palette, CSV/Excel parsing, stats (quartiles, KDE), and SVG helpers shared by `domains.html` and `plots.html`.

All tools render live to SVG and have an **Export as SVG** button.

## Run it locally
Open `index.html` in any browser. `plots.html` loads its Excel-parsing library from a CDN, so it needs an internet connection; everything else works fully offline.

## Host it on GitHub Pages
1. Create a new repository on GitHub (e.g. `figure-tools`).
2. Add `index.html`, `timeline.html`, `domains.html`, `plots.html`, `shared.js` (and this `README.md`) to the repo — via the GitHub web UI ("Add file → Upload files") or:
   ```
   git init
   git add index.html timeline.html domains.html plots.html shared.js README.md
   git commit -m "Add Analysis Plots tool"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages**.
4. Under "Build and deployment", set **Source** to "Deploy from a branch", pick branch `main` and folder `/ (root)`, then Save.
5. Your site will be live at: `https://<your-username>.github.io/<your-repo>/`

## Data format for Analysis Plots
- **Violin / Density**: each column is one group's sample values (any length); first row = group names used as legend labels.
- **Line**: column 1 = X values (e.g. residue number); each remaining column is one line series, named by its header.

## Editing further
Each HTML file is self-contained aside from the shared `shared.js`, so you can tweak any one tool without affecting the others.
