# Tabata

A mobile-first tabata timer. Plain HTML/CSS/JS, no build step — ready for GitHub Pages.

## Features

- Preset templates stored in `localStorage` (seeded with Classic Tabata: 20s on / 10s off × 6)
- Configure active duration, break duration, and rounds per preset
- Full-screen phase-colored timer that drains as time runs out
- Sound cues (WebAudio, no audio files): 3-2-1 ticks, work/rest tones, finish chime — mutable
- Pause / resume, skip forward, skip back
- Keeps the screen awake during a workout (where supported)

## Run locally

Open `index.html` in a browser, or:

```sh
python3 -m http.server
```

## Deploy

Enable GitHub Pages for the repo (Settings → Pages → deploy from `main`, root).
