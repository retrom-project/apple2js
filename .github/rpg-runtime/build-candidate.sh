#!/usr/bin/env bash
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
output=${1:?absolute empty output directory is required}
python3 "$root/.github/rpg-runtime/candidate_descriptor.py" prepare "$output"

tools_root="$root/../../retrom/.cache/tools"
node_binary=$(find "$tools_root" -type f -path '*/bin/node' -name node | sort | tail -1)
test -n "$node_binary"
export PATH="$(dirname "$node_binary"):$PATH"

cd "$root"
npm ci --no-audit --no-fund >/dev/null
node node_modules/webpack/bin/webpack.js --config .github/rpg-runtime/webpack.config.cjs --mode production >/dev/null

work=$(mktemp -d "$root/.retrom-build/apple2js-candidate.XXXXXX")
trap 'rm -rf "$work"' EXIT INT TERM
mkdir -p "$work/site/dist"
cp "$root/.retrom-build/site/dist/retrom.bundle.js" "$work/site/dist/"
cp "$root/.retrom-build/site/dist/audio_worker.bundle.js" "$work/site/dist/"
cat > "$work/site/index.html" <<'HTML'
<!doctype html><html lang="en"><meta charset="utf-8"><title>Apple IIe</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#000}
body{display:grid;place-items:center}
canvas{display:block;width:min(100vw,145.833333vh);height:auto;image-rendering:pixelated}
</style>
<canvas id="screen" width="560" height="384"></canvas>
<script src="dist/retrom.bundle.js"></script></html>
HTML

(cd "$work/site" && tar --sort=name --format=ustar --mtime='@0' --owner=0 --group=0 \
  --numeric-owner --mode='u+rwX,go+rX,go-w' -cf "$work/site.tar" index.html dist/retrom.bundle.js dist/audio_worker.bundle.js)
gzip -n -c "$work/site.tar" > "$output/apple2js-site.tar.gz"
cat LICENSE submodules/apple2shader/LICENSE submodules/cpu6502/LICENSE > "$output/LICENSE"

python3 "$root/.github/rpg-runtime/candidate_descriptor.py" paths "$output" > "$work/source-files-all"
python3 - "$work/source-files-all" "$work/source-files" <<'PY'
import sys
from pathlib import Path
source = Path(sys.argv[1]).read_bytes().split(b'\0')
excluded = (b'js/roms/system/', b'js/roms/character/', b'js/roms/cards/', b'json/disks/',
            b'submodules/cpu6502/test/roms/')
Path(sys.argv[2]).write_bytes(b'\0'.join(path for path in source if path and not path.startswith(excluded)) + b'\0')
PY
tar -C "$root" --null --verbatim-files-from -T "$work/source-files" \
  --mtime='@0' --owner=0 --group=0 --numeric-owner \
  --mode='u+rwX,go+rX,go-w' -cf "$work/source.tar"
gzip -n -c "$work/source.tar" > "$output/source.tar.gz"
python3 "$root/.github/rpg-runtime/candidate_descriptor.py" finalize "$output" --core-id apple2js
