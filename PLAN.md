# Podcast Desktop App Plan

Build a desktop app for subscribing to podcast RSS feeds and listening to episodes. The MVP excludes podcast discovery and transcripts.

## Steps

A. Set up Electron, React, and TypeScript with Bun and Vite.
B. Add RSS feed subscriptions and episode lists.
C. Add audio playback and save listening progress locally.
D. Package for macOS first.

### Step A Sub-plan: App Scaffold

1. Create a Bun-managed TypeScript project and add Electron, React, and Vite.
2. Set up separate Electron main, preload, and React renderer entry points.
3. Configure Vite for the renderer and a single development workflow that launches Electron with the React UI.
4. Keep Electron secure by enabling context isolation, disabling Node integration in the renderer, and exposing only a minimal preload API.
5. Confirm the app starts, renders a basic React screen, and builds successfully.

Keep RSS parsing, RxDB, playback, and release packaging out of this step; they belong to later steps.

### Step B Sub-plan: Feeds and Episodes

1. Add `fast-xml-parser` and `rxdb`, and define `feeds` and `episodes` RxDB collections (feed URL, title, artwork; episode GUID, title, date, audio URL, duration).
2. Fetch feed XML in the Electron main process (avoids renderer CORS limits) and expose it through a single preload IPC method, e.g. `fetchFeed(url)`.
3. Parse RSS into typed feed and episode objects, handling missing fields and enclosure-based audio URLs.
4. Persist subscriptions and episodes in RxDB, upserting episodes by GUID so refreshes do not create duplicates.
5. Build the UI: an add-feed form with URL validation and error display, a subscription list, and an episode list for the selected feed.
6. Add unsubscribe and manual refresh actions.
7. Confirm a public feed can be added, its episodes are listed, and both survive an app restart.

Keep audio playback and progress tracking out of this step; they belong to Step C.

## Suggested Technologies

- Bun for package management and scripts; Electron, React, and TypeScript for the desktop app.
- Vite for development and builds; `fast-xml-parser` for RSS; the HTML audio player for playback.
- RxDB with Dexie/IndexedDB storage in the renderer for local feeds and playback progress; `electron-builder` for packaging.

## Verification

- Add a public RSS feed, confirm episodes load, and play an episode.
- Restart the app and confirm the feed and playback position persist.