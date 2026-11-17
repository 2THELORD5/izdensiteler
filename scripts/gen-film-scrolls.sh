#!/usr/bin/env bash
# Generate PC 16:9 + MOB 9:16 chapter stills via Kie img2img → JPEG
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KIE="node $ROOT/scripts/kie.mjs"
cd "$ROOT"

to_jpg () {
  local png="$1" jpg="${1%.png}.jpg"
  if [[ -f "$png" ]]; then
    sips -s format jpeg -s formatOptions 82 "$png" --out "$jpg" >/dev/null 2>&1
    rm -f "$png"
  fi
}

gen_one () {
  local out="$1" ar="$2" ref="$3" prompt="$4"
  local jpg="${out%.png}.jpg"
  if [[ -f "$jpg" ]]; then
    echo "skip $(basename "$jpg")"
    return 0
  fi
  echo "=== gen $jpg ($ar) ==="
  if $KIE still "$prompt" "$out" --ar "$ar" --ref "$ref"; then
    to_jpg "$out"
    return 0
  fi
  echo "FAIL $jpg"
  return 1
}

gen_pair () {
  local slug="$1" ref="$2" act="$3" prompt="$4"
  local outdir="public/demos/moos-$slug/assets/kie-scrub"
  mkdir -p "$outdir/pc" "$outdir/mob"
  gen_one "$outdir/pc/${act}.png" "16:9" "$ref" "$prompt"
  gen_one "$outdir/mob/${act}.png" "9:16" "$ref" "$prompt Vertical 9:16 phone composition, subject centered, safe margins for mobile UI."
}

NEG="No text, no logo, no watermark, no UI, no purple neon grade, photoreal cinematic website hero."

R="public/demos/moos-ores/assets/opt/01-hero-living-room.jpg"
gen_pair ores "$R" 01 "Photoreal calm interior living room dawn light, soft linen sofa, oak floor, quiet luxury renovation studio mood. Same space language as reference. $NEG"
gen_pair ores "$R" 02 "Photoreal interior design process — material samples wood stone fabric on oak table, soft window light, architectural studio. $NEG"
gen_pair ores "$R" 03 "Photoreal finished spa-like bathroom with travertine and warm pendant light, serene renovation handover mood. $NEG"
gen_pair ores "public/demos/moos-ores/assets/opt/08-portfolio-sauna-a.jpg" 04 "Photoreal sauna interior cedar wood steam soft glow, premium residential spa. $NEG"

R="public/previews/peak.jpg"
[[ -f public/demos/moos-peak/images/about/peak-about-materials.webp ]] && R="public/demos/moos-peak/images/about/peak-about-materials.webp"
gen_pair peak "$R" 01 "Photoreal modern interior horizon view through floor-to-ceiling glass, dusk city lights soft, luxury apartment. $NEG"
gen_pair peak "$R" 02 "Photoreal material board marble brass walnut samples arranged on dark table, interior design studio. $NEG"
gen_pair peak "$R" 03 "Photoreal hotel suite bedroom soft daylight linen bedding minimal furniture contemporary. $NEG"
gen_pair peak "$R" 04 "Photoreal living room with curated lighting and textured walls, calm interiors mood. $NEG"

R="public/previews/retro.jpg"
gen_pair retro "$R" 01 "Photoreal 1970s inspired interior lounge velvet chair brass lamp warm film grain subtle, atelier. $NEG"
gen_pair retro "$R" 02 "Photoreal vintage wood workshop craft tools warm tungsten light, interior atelier. $NEG"
gen_pair retro "$R" 03 "Photoreal mid-century apartment living room restored, sun through curtains. $NEG"
gen_pair retro "$R" 04 "Photoreal detail of lacquered wood furniture and ceramic vase, retro craft close-up. $NEG"

R="public/demos/moos-bold/assets/bold-website-images/hero-bold-landmark.jpg"
gen_pair bold "$R" 01 "Photoreal futuristic landmark architecture mirrored in still water at dusk, cinematic wide. $NEG"
gen_pair bold "$R" 02 "Photoreal architectural massing model concrete and glass, dramatic side light studio. $NEG"
gen_pair bold "$R" 03 "Photoreal night silhouette of iconic building skyline reflection water. $NEG"
gen_pair bold "$R" 04 "Photoreal cultural waterfront landmark plaza soft evening light. $NEG"

R="public/previews/sapa.jpg"
[[ -f public/demos/moos-sapa/assets/Exterior/01-drone-three-quarter-day.png ]] && R="public/demos/moos-sapa/assets/Exterior/01-drone-three-quarter-day.png"
gen_pair sapa "$R" 01 "Photoreal luxury residential complex drone three-quarter view daylight landscaped. $NEG"
gen_pair sapa "$R" 02 "Photoreal residence lobby warm stone and wood, soft hospitality light. $NEG"
gen_pair sapa "$R" 03 "Photoreal apartment living with terrace garden view golden hour. $NEG"
gen_pair sapa "$R" 04 "Photoreal masterplan community green courtyard aerial soft daylight. $NEG"

R="public/previews/leaft.jpg"
[[ -f public/demos/moos-leaft/assets/img/p09-day.jpg ]] && R="public/demos/moos-leaft/assets/img/p09-day.jpg"
gen_pair leaft "$R" 01 "Photoreal landscaped garden path day light native plants stone edge. $NEG"
gen_pair leaft "$R" 02 "Photoreal same garden dusk blue hour soft landscape lighting. $NEG"
gen_pair leaft "$R" 03 "Photoreal garden construction process soil grading and plant placement. $NEG"
gen_pair leaft "$R" 04 "Photoreal finished courtyard with water feature evening calm. $NEG"

echo "DONE film scroll stills"
