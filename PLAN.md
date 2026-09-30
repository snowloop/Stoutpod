# Podcast Desktop App Plan

Build a desktop app for subscribing to podcast RSS feeds and listening to episodes. The MVP excludes podcast discovery and transcripts.

## Steps

1. Set up Electron, React, and TypeScript with Bun and Vite.
2. Add RSS feed subscriptions and episode lists.
3. Add audio playback and save listening progress locally.
4. Package for macOS first.

## Suggested Technologies

- Bun for package management and scripts; Electron, React, and TypeScript for the desktop app.
- Vite for development and builds; `fast-xml-parser` for RSS; the HTML audio player for playback.
- RxDB with Dexie/IndexedDB storage for local feeds and playback progress; `electron-builder` for packaging.

## Verification

- Add a public RSS feed, confirm episodes load, and play an episode.
- Restart the app and confirm the feed and playback position persist.