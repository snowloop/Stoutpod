# stoutpod

A desktop podcast reader for RSS feeds.

## Install (macOS)

```bash
curl -fsSL https://raw.githubusercontent.com/snowloop/Stoutpod/main/scripts/install.sh | bash
```

The script downloads the latest release for your Mac (Apple Silicon or Intel) and installs it to `/Applications`. The app is not signed, so installing through the script avoids the Gatekeeper warning that a browser download triggers. You can read [scripts/install.sh](scripts/install.sh) before running it.

If you downloaded the zip from the releases page instead, remove the quarantine flag after moving the app to `/Applications`:

```bash
xattr -cr /Applications/Stoutpod.app
```

## Development

To install dependencies:

```bash
pnpm install
```

To run in development:

```bash
pnpm dev
```

To build a macOS package:

```bash
pnpm package
```

To publish a release to GitHub (needs `GITHUB_TOKEN`, then publish the draft release on GitHub):

```bash
pnpm publish:arm64
pnpm publish:x64
```
