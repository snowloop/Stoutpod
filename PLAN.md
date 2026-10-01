# Podcast Desktop App Plan

Build a desktop app for subscribing to podcast RSS feeds and listening to episodes. The MVP excludes podcast discovery and transcripts.

## Steps

1. Set up Electron, React, and TypeScript with Bun and Vite.
2. Add RSS feed subscriptions and episode lists.
3. Add audio playback and save listening progress locally.
4. Package for macOS first.

### Step 1 Sub-plan: App Scaffold

1. Create a Bun-managed TypeScript project and add Electron, React, and Vite.
2. Set up separate Electron main, preload, and React renderer entry points.
3. Configure Vite for the renderer and a single development workflow that launches Electron with the React UI.
4. Keep Electron secure by enabling context isolation, disabling Node integration in the renderer, and exposing only a minimal preload API.
5. Confirm the app starts, renders a basic React screen, and builds successfully.

Keep RSS parsing, RxDB, playback, and release packaging out of this step; they belong to later steps.

## Suggested Technologies

- Bun for package management and scripts; Electron, React, and TypeScript for the desktop app.
- Vite for development and builds; `fast-xml-parser` for RSS; the HTML audio player for playback.
- RxDB with Dexie/IndexedDB storage for local feeds and playback progress; `electron-builder` for packaging.

## Verification

- Add a public RSS feed, confirm episodes load, and play an episode.
- Restart the app and confirm the feed and playback position persist.