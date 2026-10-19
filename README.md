# The Siren System

A self-contained static web app. No package installation or build step is required.

## Open in VS Code

Open the `siren-system` folder in VS Code. The app files are in `dist/`:

- `dist/index.html` — page structure and written content
- `dist/styles.css` — colours, typography, layout and responsive styles
- `dist/app.js` — quests, XP, levels, streaks, Pearls, routines, journal and saved settings

## Preview locally

The easiest option is the VS Code **Live Server** extension: open `dist/index.html` and choose **Open with Live Server**. You can also start a simple server from the `dist` folder with `python3 -m http.server 8000`, then visit `http://localhost:8000`.

Your diary is saved in the browser's local storage on the device where you use it. Use **Save a copy of my diary** in the app to export a backup.

## Scoring note

The app preserves the recovered original quest values and 235 XP daily checklist total. Settings explains which quest labels, level thresholds, Pearl conversion and treats are reconstructed because the full handbook was not present in the project files.
