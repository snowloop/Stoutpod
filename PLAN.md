# Podcast Desktop App Plan

Build a desktop app for subscribing to podcast RSS feeds and listening to episodes. The MVP excludes podcast discovery and transcripts.

## Steps

A. Set up Electron, React, and TypeScript with Node.js, pnpm, and Vite.
B. Add RSS feed subscriptions and episode lists.
C. Add audio playback and save listening progress locally.
D. Display feed and episode cover art.
E. Package for macOS first.

### Step A Sub-plan: App Scaffold

1. Create a pnpm-managed TypeScript project and add Electron, React, and Vite.
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

### Step C Sub-plan: Playback and Progress

1. Add a `progress` RxDB collection keyed by episode id (`episodeId`, `positionSeconds`, `durationSeconds`, `completed`, `updatedAt`). Keep it separate from `episodes` so a feed refresh (which upserts episodes) never overwrites listening state.
2. Check the renderer Content Security Policy and Electron settings so `<audio>` can stream remote `http(s)` enclosure URLs, including redirects; fix in `index.html` or main process only if blocked.
3. Add a `PlayerProvider` (React context) owning one `HTMLAudioElement`, exposing `current`, `isPlaying`, `position`, `duration`, and `play(episode)`, `pause()`, `seek(seconds)`. Starting an episode resumes from its saved position.
4. Add a `progressService` and `useProgress` hook: read/write progress documents, save at most every ~5 s while playing, and flush on pause, seek, `ended`, episode switch, and `beforeunload`.
5. Mark an episode `completed` on `ended` or when within the last ~10 s; reset position to 0 on completion.
6. Build the UI: a play button on each episode row, a persistent bottom player bar (title, play/pause, seek slider, elapsed/total time), and a per-episode indicator (progress or "played").
7. Handle audio errors (unreachable URL, unsupported format) with a visible message in the player bar instead of failing silently.
8. Confirm an episode plays, pause/seek work, and after an app restart the same episode resumes at the saved position and completed episodes show as played.

Keep playback speed, queues, downloads, and media-key integration out of this step.

### Step D Sub-plan: Cover Art

1. Add an optional `imageUrl` to the `episodes` schema (bump the schema `version` to 1 with a migration strategy that returns the document unchanged), and parse the per-item `itunes:image` `href` in `parseFeed`. The feed-level `imageUrl` is already parsed and stored.
2. Add a `Cover` component that renders an `<img>` at a fixed size with `loading="lazy"`, an empty `alt`, and a placeholder (initial letter on a neutral background) when the URL is missing or fails to load.
3. Resolve an episode's artwork as episode `imageUrl`, then its feed's `imageUrl`, then the placeholder; keep this in one small helper used by all views.
4. Show the feed cover next to each subscription and in a header above the episode list, and the episode cover on each episode row.
5. Show the current episode's cover in the player bar.
6. Confirm remote artwork loads in both dev and the built app (no CSP or `file://` issues), that episodes without their own image fall back to the feed cover, and that a broken image URL shows the placeholder instead of a broken-image icon.

Keep image caching, offline storage of artwork, and resizing or color extraction out of this step.

## Suggested Technologies

- Node.js and pnpm for package management and scripts; Electron, React, and TypeScript for the desktop app.
- Vite for development and builds; `fast-xml-parser` for RSS; the HTML audio player for playback.
- RxDB with Dexie/IndexedDB storage in the renderer for local feeds and playback progress; `electron-builder` for packaging.

## Verification

- Add a public RSS feed, confirm episodes load, and play an episode.
- Restart the app and confirm the feed and playback position persist.