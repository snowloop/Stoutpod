# Podcast Desktop App Plan

Build a desktop app for subscribing to podcast RSS feeds and listening to episodes. The MVP excludes podcast discovery and transcripts.

## Steps

A. Set up Electron, React, and TypeScript with Node.js, pnpm, and Vite.
B. Add RSS feed subscriptions and episode lists.
C. Add audio playback and save listening progress locally.
D. Display feed and episode cover art.
E. Package for macOS with Electron Forge and distribute through GitHub Releases.

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

### Step E Sub-plan: macOS Packaging and GitHub Releases

The flow is: Forge builds the app into per-architecture `.zip` files and publishes them to a GitHub Release, where users download them directly. Homebrew distribution is out of scope.

1. Prepare the project for Forge: set `productName` (`Stoutpod`), `version`, `description`, `author`, and `license` in `package.json`; add `@electron-forge/cli` and `@electron-forge/maker-zip` to `devDependencies`; move the packages Vite bundles (`react`, `react-dom`, `rxdb`, `rxjs`, `fast-xml-parser`) to `devDependencies` too, since the packaged app ships only `dist/`.
2. Create `forge.config.cjs` (the project is `"type": "module"`) with `packagerConfig`: `name`, `appBundleId` (e.g. `com.<you>.stoutpod`), `appCategoryType` (`public.app-category.music`), `icon: "build/icon"` (the `.icns` without extension), `asar: true`, and an `ignore` function that ships only `dist/` and `package.json`.
3. Generate `build/icon.icns` from a rounded `build/dock.png` using `sips` and `iconutil` with an `icon.iconset` folder (sizes 16 to 512 with `@2x` variants); commit the `.icns`.
4. Add the scripts `package` (`pnpm run build && electron-forge package`) and `make` (`pnpm run build && electron-forge make`), plus `make:arm64` and `make:x64`. `vite-plugin-electron` produces `dist/` itself, so use no Forge Vite plugin; Forge only packages the built output. `package` creates a runnable `.app` in `out/`; `make` wraps it into distributable files in `out/make/`.
5. Add `@electron-forge/maker-zip` for `darwin` and optionally `@electron-forge/maker-dmg` for a friendlier download. Build `arm64` and `x64` separately (`--arch`) so each Mac gets a matching file.
6. Check that the packaged app starts: run `pnpm package`, open `out/Stoutpod-darwin-<arch>/Stoutpod.app`, and confirm feeds load, audio plays, covers show, the dock icon is correct, and data persists after restart.
7. Optionally sign and notarize: enroll in the Apple Developer Program, create a "Developer ID Application" certificate, and add `osxSign` and `osxNotarize` (`appleId`, `appleIdPassword` app-specific password, `teamId`) to `packagerConfig`, reading credentials from environment variables. Without it, Gatekeeper blocks the downloaded app and users must right-click and choose Open the first time.
8. Publish: add `@electron-forge/publisher-github` with `repository: { owner, name }`, `prerelease: false` and `draft: true`; provide `GITHUB_TOKEN` (for example `GITHUB_TOKEN=$(gh auth token)`), then run `pnpm publish:arm64` and `pnpm publish:x64` to upload both zips to the `vX.Y.Z` release, and publish the draft on GitHub. The repository must be public for users to download the assets.
9. Release routine: bump `version` in `package.json`, run both publish scripts, and publish the draft release. Optionally automate this with a GitHub Actions workflow on a macOS runner triggered by version tags.

Keep auto-update (`update-electron-app`), Windows and Linux makers, Homebrew, and the Mac App Store out of this step.

## Suggested Technologies

- Node.js and pnpm for package management and scripts; Electron, React, and TypeScript for the desktop app.
- Vite for development and builds; `fast-xml-parser` for RSS; the HTML audio player for playback.
- RxDB with Dexie/IndexedDB storage in the renderer for local feeds and playback progress; Electron Forge (`@electron-forge/cli`) for packaging and publishing to GitHub Releases.

## Verification

- Add a public RSS feed, confirm episodes load, and play an episode.
- Restart the app and confirm the feed and playback position persist.