# The Siren System

A self-contained static web app. No package installation or build step is required.

## Files (all in `dist/`)

- `index.html`: page shell and the loading screen
- `styles.css`: themes, typography, layout
- `app.js`: plan, rituals, vitals, reviews, journal, settings, backups
- `logo.svg`, `icon-*.png`, `manifest.webmanifest`, `sw.js`: logo, home-screen icons, installable app and offline support

## Preview locally

Open `dist/index.html` directly, or run `python3 -m http.server 8000` inside `dist` and visit `http://localhost:8000`.

## Your data

Your diary is saved in the browser's local storage on that device. Use **Settings → Save a backup** regularly, and on iPad use **Share → Add to Home Screen** so Safari does not clear inactive site data. **Restore from a backup** brings a saved copy back.

## Scoring note

The recovered original quest values and 235 XP full checklist are preserved. The +50 daily bonus is now for finishing everything in *your* plan. Level thresholds, Pearl conversion and rewards are reconstructed defaults.
