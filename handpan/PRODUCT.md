# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Handpan learners, beginner to intermediate, often without a teacher. They use the site next to their own instrument: a laptop or phone propped up while they play a real handpan, reading the pattern and the note numbers from the screen and playing along on the pan.

## Product Purpose

Show a learner what to play on their own handpan, and let them hear it. The site lays out their tuning as it sits on the instrument, numbers the notes of whatever they play over (the scale, a chord, a chord progression), and walks them through playing patterns step by step, with hands, taks and rests, at a tempo they set. Success is a learner who can pick a tuning, read a pattern off the screen and play it on the real pan.

## Positioning

The patterns are not written for one tuning: numbers follow the notes of the chosen scale, chord or progression on the learner's own tuning, top and bottom, so the same pattern works on any of the supported pans and moves with the harmony.

## Operating Context

- Played alongside a real handpan; the screen is read at arm's length or further while both hands are busy on the instrument.
- Often on a phone, sometimes a laptop.
- Practice sessions loop a pattern while the learner plays along; the learner also taps the on-screen pan or uses the keyboard to check a note.
- Terms in use: ding (the centre note), tone fields, top and bottom, tak (a tap on the shell), tuning names such as D Kurd 9 and B Hijaz.

## Capabilities and Constraints

- Ten tunings, including mutant tunings with bottom notes; linked directly as `#<tuning-id>`.
- Play over the scale, a chord found on the tuning, or a chord progression (generic ones plus tunings' own).
- Guided patterns by level, including arpeggios over chords; switches take effect on beat 1.
- Synthesized sound in the browser (WebAudio); no recordings.
- Must stay phone-friendly: usable on a phone screen, controls reachable while playing.
- Existing codebase is plain HTML, CSS and JavaScript served by GitHub Pages, with music logic tested in plain Node (`npm test`). Whether to keep it dependency-free was not stated as a requirement.

## Evidence on Hand

- Tunings, chords, progressions and patterns in `tunings.js` and `model.js`.
- No testimonials, user numbers, teachers or press; none should be invented.
- Tunings show common layouts; real instruments vary by maker, and the site says so.

## Product Principles

- The real instrument comes first: the screen supports playing a handpan, it does not replace it.
- Readable from a distance: what to play next is the most visible thing on screen.
- Works on the learner's own pan: content adapts to the tuning instead of assuming one.
- A switch never breaks the groove: changes land on beat 1.
