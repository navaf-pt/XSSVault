#!/usr/bin/env bash
# Fetches Debian packages without root and unpacks their libs into .chromium-libs,
# so the Playwright chromium-headless-shell used for verification can run.
set -uo pipefail
LIBS="$(cd "$(dirname "$0")/.." && pwd)/.chromium-libs"
IDX=/tmp/bookworm-Packages
mkdir -p "$LIBS"
if [ ! -f "$IDX" ]; then
  curl -s http://deb.debian.org/debian/dists/bookworm/main/binary-amd64/Packages.gz | gunzip > "$IDX"
fi
resolve() {
  awk -v p="$1" 'BEGIN{RS="";} {n=split($0,L,"\n"); if(L[1]=="Package: "p){for(i=1;i<=n;i++) if(L[i] ~ /^Filename:/){sub(/^Filename: /,"",L[i]); print L[i]; exit}}}' "$IDX"
}
for pkg in "$@"; do
  f=$(resolve "$pkg")
  if [ -z "$f" ]; then echo "MISS $pkg"; continue; fi
  base=$(basename "$f")
  if [ ! -f "/tmp/debs/$base" ]; then
    mkdir -p /tmp/debs
    curl -s -o "/tmp/debs/$base" "http://deb.debian.org/debian/$f" || echo "DLFAIL $pkg"
  fi
  dpkg -x "/tmp/debs/$base" "$LIBS/" 2>/dev/null || echo "XFAIL $pkg"
done
echo "=== remaining missing libs for chromium-headless-shell ==="
CHROME=$(ls -d "$HOME"/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1)
LD_LIBRARY_PATH="$LIBS/usr/lib/x86_64-linux-gnu" ldd "$CHROME" 2>/dev/null | grep 'not found' || echo "none"
