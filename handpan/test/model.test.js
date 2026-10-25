const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const M = require('../model.js');

// tunings.js is a browser script that fills in window.*
globalThis.window = {};
require(path.join(__dirname, '..', 'tunings.js'));
const { HANDPAN_TUNINGS: TUNINGS, HANDPAN_PATTERNS: PATTERNS } = globalThis.window;

const tuning = (id) => M.buildTuning(TUNINGS.find((t) => t.id === id));
const names = (notes) => notes.map((o) => o.name);
// A pattern's steps as note names, e.g. 'B2 F#3+A3 T .'
const played = (steps) => steps.map((s) => (s.kind === 'rest' ? '.' : s.kind === 'tak' ? 'T' : s.notes.map((o) => o.name).join('+'))).join(' ');

test('toMidi', () => {
  assert.equal(M.toMidi('A4'), 69);
  assert.equal(M.toMidi('C4'), 60);
  assert.equal(M.toMidi('F#3'), 54);
  assert.equal(M.toMidi('Eb3'), M.toMidi('D#3'));
  assert.throws(() => M.toMidi('H4'), /Bad note/);
});

test('pc wraps negative numbers', () => {
  assert.equal(M.pc(61), 1);
  assert.equal(M.pc(-1), 11);
});

test('pitchClass strips the octave', () => {
  assert.equal(M.pitchClass('F#3'), 'F#');
  assert.equal(M.pitchClass('Bb-1'), 'Bb');
});

test('buildTuning: ding first, then top, then bottom', () => {
  const T = tuning('b-hijaz');
  assert.equal(T.notes[0].name, 'B2');
  assert.ok(T.notes[0].isDing);
  assert.equal(T.notes.filter((o) => o.side === 'top').length, 9);
  assert.equal(T.notes.filter((o) => o.side === 'bottom').length, 8);
});

test('buildTuning: generated selections start with the scale, then chords on the ding', () => {
  const T = tuning('d-kurd-9');
  assert.ok(T.selections[0].scale);
  assert.equal(T.selections[1].name, 'Dm');
  assert.ok(T.selections.length <= 10);
});

test('degreesFor: top-only tuning numbers the top fields, ding excluded', () => {
  const T = tuning('d-kurd-9');
  assert.deepEqual(names(M.degreesFor(T.selections[0], T)), T.def.top);
});

test('degreesFor: B Hijaz scale numbers top and bottom by pitch, skipping notes outside it', () => {
  const T = tuning('b-hijaz');
  assert.deepEqual(names(M.degreesFor(T.selections[0], T)),
    ['Eb3', 'F#3', 'G3', 'A3', 'B3', 'C4', 'D#4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'Eb5', 'E5']);
});

test('degreesFor: a chord numbers its notes anywhere on the pan', () => {
  const T = tuning('b-hijaz');
  const eMinor = T.selections.find((s) => s.name === 'E minor');
  assert.deepEqual(names(M.degreesFor(eMinor, T)), ['G3', 'B3', 'E4', 'G4', 'B4', 'E5']);
});

test('parsePattern: ding, numbers, taks and rests', () => {
  const T = tuning('d-kurd-9');
  const deg = M.degreesFor(T.selections[0], T);
  assert.equal(played(M.parsePattern('D 1 T . 8', T.notes, deg, false)), 'D3 A3 T . A4');
});

test('parsePattern: ranges up, down and from the top', () => {
  const T = tuning('d-integral');
  const deg = M.degreesFor(T.selections[0], T);
  assert.equal(played(M.parsePattern('1..3', T.notes, deg, false)), 'A3 Bb3 C4');
  assert.equal(played(M.parsePattern('N..N-2', T.notes, deg, false)), 'A4 F4 E4');
  assert.equal(played(M.parsePattern('N-1..2', T.notes, deg, false)), 'F4 E4 D4 C4 Bb3');
});

test('parsePattern: simultaneous strikes and fixed note names', () => {
  const T = tuning('b-hijaz');
  const deg = M.degreesFor(T.selections[0], T);
  assert.equal(played(M.parsePattern('D+5 G3+Eb5', T.notes, deg, false)), 'B2+B3 G3+Eb5');
});

test('parsePattern: hands alternate, chords use both', () => {
  const T = tuning('d-kurd-9');
  const deg = M.degreesFor(T.selections[0], T);
  const steps = M.parsePattern('D 1 . 2 1+3 4', T.notes, deg, false);
  assert.deepEqual(steps.map((s) => s.hand), ['R', 'L', undefined, 'R', 'R+L', 'R']);
});

test('parsePattern: does not fit without wrap, wraps on chords', () => {
  const T = tuning('d-kurd-9');
  const chord = T.selections[1];
  const deg = M.degreesFor(chord, T);
  assert.equal(M.parsePattern('99', T.notes, deg, false), null);
  assert.equal(M.parsePattern('Q4', T.notes, deg, false), null);
  const n = deg.length;
  assert.equal(played(M.parsePattern(String(n + 1), T.notes, deg, true)), deg[0].name);
});

test('parsePattern: wrapping never strikes the same note twice', () => {
  const T = tuning('d-kurd-9');
  const deg = M.degreesFor(T.selections[1], T).slice(0, 3);
  const [step] = M.parsePattern('1+4', T.notes, deg, true);
  assert.equal(step.notes.length, 2);
  assert.notEqual(step.notes[0], step.notes[1]);
});

test('patternsFor: own patterns only on the scale, shared ones everywhere they fit', () => {
  const T = tuning('b-hijaz');
  const onScale = M.patternsFor(T, 0, PATTERNS).patterns.map((p) => p.name);
  const onChord = M.patternsFor(T, 1, PATTERNS).patterns.map((p) => p.name);
  assert.ok(onScale.includes('Hijaz motif'));
  assert.ok(!onChord.includes('Hijaz motif'));
  assert.ok(onChord.includes('Up and back'));
});

// ---- data checks on tunings.js ----

for (const def of TUNINGS) {
  test(`${def.name}: notes are valid and the top runs low to high`, () => {
    const T = M.buildTuning(def);
    const top = T.notes.filter((o) => o.side === 'top' && !o.isDing).map((o) => o.midi);
    assert.deepEqual(top, [...top].sort((a, b) => a - b));
    assert.equal(new Set(T.notes.map((o) => o.name)).size, T.notes.length, 'duplicate note');
  });

  test(`${def.name}: every selection has notes on the pan`, () => {
    const T = M.buildTuning(def);
    for (const sel of T.selections) {
      const members = M.selectionMembers(sel, T);
      const present = new Set(members.map((o) => M.pc(o.midi)));
      assert.deepEqual([...sel.pcs].sort(), [...present].sort(), `${sel.name} has a note not on the pan`);
    }
  });

  for (const p of def.patterns || []) {
    test(`${def.name}: own pattern "${p.name}" fits its scale`, () => {
      const T = M.buildTuning(def);
      const fits = M.patternsFor(T, 0, PATTERNS).patterns.some((q) => q.own && q.name === p.name);
      assert.ok(fits, `"${p.name}" uses a note or number that is not on ${def.name}`);
    });
  }
}

test('shared patterns all fit the most common tuning', () => {
  const T = tuning('d-kurd-9');
  const fit = new Set(M.patternsFor(T, 0, PATTERNS).patterns.map((p) => p.name));
  for (const p of PATTERNS) assert.ok(fit.has(p.name), p.name);
});

test('B Hijaz own patterns play the same notes as before pitch-order numbering', () => {
  const T = tuning('b-hijaz');
  const { patterns } = M.patternsFor(T, 0, PATTERNS);
  const get = (name) => played(patterns.find((p) => p.name === name).parsed);
  assert.equal(get('Snake charmer'), 'B2 B3 C4 B3 D#4 C4 B3 . B3 C4 E4 D#4 C4 B3 C4 .');
  assert.equal(get('Waterfall'), 'E5 Eb5 B4 A4 G4 F#4 E4 D#4 C4 B3 B2 . . .');
});
