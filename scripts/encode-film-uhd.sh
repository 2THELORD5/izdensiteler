#!/usr/bin/env bash
# Re-encode film clips → Ultra HD all-intra scrub film (PC 1920×1080 / MOB 1080×1920)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FF="$(python3 -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')"
ENC=(-c:v libx264 -pix_fmt yuv420p -g 1 -keyint_min 1 -sc_threshold 0 -bf 0 -preset medium -an -movflags +faststart)

encode_side() {
  local slug="$1" side="$2" w="$3" h="$4" srcdir="$5"
  local outdir="$ROOT/public/demos/moos-$slug/assets/kie-scrub"
  local tmp="/tmp/izden_uhd_${slug}_${side}"
  mkdir -p "$tmp" "$outdir"
  local list="$tmp/list.txt"
  : > "$list"
  local i=1
  for f in "$srcdir"/${side}-0{1,2,3,4}.mp4; do
    [[ -f "$f" ]] || continue
    local norm="$tmp/$(printf '%02d' $i).mp4"
    echo "  norm $slug $side $(basename "$f") → ${w}x${h}"
    "$FF" -y -i "$f" \
      -vf "scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},fps=30" \
      "${ENC[@]}" -crf 19 "$norm" >/dev/null 2>&1
    echo "file '$norm'" >> "$list"
    i=$((i+1))
  done
  if [[ ! -s "$list" ]]; then
    echo "  SKIP $slug $side (no clips in $srcdir)"
    return 1
  fi
  local out="$outdir/film-${side}.mp4"
  "$FF" -y -f concat -safe 0 -i "$list" -c copy -movflags +faststart "$out" >/dev/null 2>&1
  # if copy fails due to mismatch, re-encode concat
  if [[ ! -s "$out" ]]; then
    "$FF" -y -f concat -safe 0 -i "$list" "${ENC[@]}" -crf 19 "$out" >/dev/null 2>&1
  fi
  ls -lh "$out"
}

# Prefer _hq, else _build
for slug in ores sapa leaft bold retro peak grids kstudio greenit blok niche trio; do
  base="$ROOT/public/demos/moos-$slug/assets/kie-scrub"
  src=""
  if [[ -d "$base/_hq" ]] && [[ -f "$base/_hq/pc-01.mp4" ]]; then
    src="$base/_hq"
  elif [[ -d "$base/_build" ]] && [[ -f "$base/_build/pc-01.mp4" ]]; then
    src="$base/_build"
  else
    echo "SKIP $slug — no clips"
    continue
  fi
  echo "=== UHD encode $slug from $(basename "$src") ==="
  encode_side "$slug" pc 1920 1080 "$src" || true
  encode_side "$slug" mob 1080 1920 "$src" || true
done
echo DONE
