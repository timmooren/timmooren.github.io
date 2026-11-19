# Beest Boulders Amsterdam in 3D

An unofficial 3D model of the Beest Boulders Amsterdam bouldering gym that you can turn,
zoom and fly through in the browser. Plain HTML with three.js from a CDN, no build step.

## What is real and what is not

- The floor plan (walls, mats, bar, rooms) and the boulders' positions and hold colours come
  from the gym's public TopLogger map.
- The scale (30 x 78 m), wall heights, wall angles, individual holds, furniture and people are
  estimated or generated. It looks like the gym; it is not a survey of it.

## Files

- `index.html`: the viewer (orbit controls, wall labels, fly-to per wall)
- `beest.glb`: the model, Draco-compressed, about 1 MB
- `walls.json`: label positions

The model is built in Blender from a script and exported to `beest.glb`; those sources are
not in this repository.

## Run locally

```sh
python3 -m http.server
```
