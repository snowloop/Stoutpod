#!/usr/bin/env bash
# Usage: curl -fsSL https://raw.githubusercontent.com/snowloop/Stoutpod/main/scripts/install.sh | bash
set -euo pipefail

repo="snowloop/Stoutpod"
target="/Applications/Stoutpod.app"
work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

case "$(uname -m)" in
  arm64) arch="arm64" ;;
  x86_64) arch="x64" ;;
  *) echo "Unsupported architecture: $(uname -m)" >&2; exit 1 ;;
esac

if pgrep -x Stoutpod >/dev/null; then
  echo "Quit Stoutpod before installing." >&2
  exit 1
fi

# Draft releases are not returned here, so publish the release on GitHub first.
url="$(curl -fsSL "https://api.github.com/repos/$repo/releases/latest" \
  | grep -o "\"browser_download_url\": *\"[^\"]*darwin-$arch[^\"]*\.zip\"" \
  | head -n 1 \
  | sed 's/.*: *"\(.*\)"/\1/')"

if [[ -z "$url" ]]; then
  echo "No $arch build found in the latest release." >&2
  exit 1
fi

echo "Downloading $url"
# curl downloads carry no quarantine flag, so Gatekeeper does not block the unsigned app.
curl -fsSL "$url" -o "$work_dir/Stoutpod.zip"
ditto -x -k "$work_dir/Stoutpod.zip" "$work_dir"

rm -rf "$target"
ditto "$work_dir/Stoutpod.app" "$target"

echo "Installed $target"
