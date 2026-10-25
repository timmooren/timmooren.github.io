# Handpan

A playable handpan in the browser. Plain HTML/CSS/JS, no build step.

## Features

- Pitch-sized tone fields on the top and (for mutant tunings) bottom of the pan, with a mirror toggle for the bottom view
- Ten tunings, B Hijaz by default; pick one from the menu or link directly with `#d-kurd-9` etc.
- Scales and chords highlighted on the instrument (chords are detected automatically for each tuning)
- Guided playing patterns with step notation, R/L hand hints, tempo and loop
- Chord grooves: patterns built from any chord on the current tuning, linked to the chord picked under Scales & chords
- Synthesized sound (WebAudio): tuned partial pairs that shimmer, a bright-to-mellow strike, sympathetic resonance between fields, the ding's cavity boom, stereo placement, a warm room reverb, and a tak (click, shell ring, cavity pop, nearby fields humming) placed where you tap the shell
- Keyboard: Space = ding, 1–9/0 = tone fields, T = tak, P = play/stop pattern

## Adding a tuning or pattern

Edit `tunings.js`. Each tuning lists its ding, its top notes from low to high (they are laid out in the usual zig-zag), and optional bottom notes with angles. Pattern syntax is documented at the top of that file.

## Run locally

```sh
python3 -m http.server
```

## Tests

The music and pattern logic lives in `model.js` (no DOM or audio), so it can be tested in plain Node:

```sh
npm test
```

This uses Node's built-in test runner and needs no dependencies. Besides the logic itself, the tests check `tunings.js`: valid notes, top notes in order, and every tuning's own patterns fitting its scale. Run them after adding a tuning or pattern. They also run on every push, before the site deploys.
