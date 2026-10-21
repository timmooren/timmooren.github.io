# Handpan

A playable handpan in the browser. Plain HTML/CSS/JS, no build step.

## Features

- Pitch-sized tone fields on the top and (for mutant tunings) bottom of the pan, with a mirror toggle for the bottom view
- Ten tunings, B Hijaz by default; pick one from the menu or link directly with `#d-kurd-9` etc.
- Scales and chords highlighted on the instrument (chords are detected automatically for each tuning)
- Guided playing patterns with step notation, R/L hand hints, tempo and loop
- Synthesized sound (WebAudio): tuned partials, strike click, reverb, and a tak when you tap the shell
- Keyboard: Space = ding, 1–9/0 = tone fields, T = tak, P = play/stop pattern

## Adding a tuning or pattern

Edit `tunings.js`. Each tuning lists its ding, its top notes from low to high (they are laid out in the usual zig-zag), and optional bottom notes with angles. Pattern syntax is documented at the top of that file.

## Run locally

```sh
python3 -m http.server
```
