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
  const eMinor = T.selections.find((s) => s.name === 'Em');
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

test('parsePattern: N and N-1 on their own', () => {
  const T = tuning('d-integral');
  const deg = M.degreesFor(T.selections[0], T);
  assert.equal(played(M.parsePattern('1 N N-1', T.notes, deg, false)), 'A3 A4 F4');
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

test('progressions: generic ones take the tuning\'s own chords on each root', () => {
  const T = tuning('d-kurd-9');
  const chordNames = (name) => T.progressions.find((p) => p.name === name).chords.map((i) => T.selections[i].name);
  assert.deepEqual(chordNames('Two-step'), ['Dm', 'C']);
  assert.deepEqual(chordNames('Andalusian'), ['Dm', 'C', 'Bb', 'Am']);
  assert.ok(!T.progressions.some((p) => p.name === 'Pop'), 'D Kurd has no chord on its sixth');
});

test('progressions: a tuning\'s own come first, and duplicates are dropped', () => {
  const T = tuning('b-hijaz');
  assert.equal(T.progressions[0].name, 'Hijaz cadence');
  const keys = T.progressions.map((p) => p.chords.join(' '));
  assert.equal(new Set(keys).size, keys.length);
});

test('patternsFor: within a progression, only patterns that fit every chord', () => {
  const T = tuning('d-kurd-9');
  // Chords wrap numbers around; the scale does not, so 20 only fits chords.
  const shared = [
    { name: 'Anywhere', level: 'Beginner', steps: 'D 1 2 3' },
    { name: 'High', level: 'Beginner', steps: 'D 1 20' },
  ];
  const dm = T.selections.findIndex((s) => s.name === 'Dm');
  assert.equal(M.patternsFor(T, dm, shared).patterns.length, 2);
  assert.deepEqual(M.patternsFor(T, dm, shared, [dm, 0]).patterns.map((p) => p.name), ['Anywhere']);
});

test('usesChordNotes: numbers and N count, the ding, taks and fixed notes do not', () => {
  const uses = (steps) => M.usesChordNotes({ steps });
  assert.equal(uses('D . T . D D T .'), false);
  assert.equal(uses('D A3 . T'), false);
  assert.equal(uses('D 1 2 3'), true);
  assert.equal(uses('D+3 . .'), true);
  assert.equal(uses('D N..1'), true);
});

test('patternsFor: a progression leaves out patterns that sound the same on every chord', () => {
  const T = tuning('d-kurd-9');
  const { chords } = T.progressions[0];
  const shared = PATTERNS.concat({ name: 'Ding only', level: 'Beginner', steps: 'D . T . D D T .' });
  const names = M.patternsFor(T, chords[0], shared, chords).patterns.map((p) => p.name);
  assert.ok(!names.includes('Ding only'));
  assert.ok(names.includes('Ding and walk'));
});

test('nextChord: starts on the picked chord, then one chord per run, looping', () => {
  const prog = { chords: [3, 5, 7], pos: 0, fresh: true };
  const order = [];
  for (let k = 0; k < 5; k++) order.push(M.nextChord(prog, true));
  assert.deepEqual(order, [0, 1, 2, 0, 1]);
});

test('nextChord: without loop, ends after the last chord', () => {
  const prog = { chords: [3, 5], pos: 0, fresh: true };
  assert.deepEqual([0, 1, 2].map(() => M.nextChord(prog, false)), [0, 1, -1]);
});

test('nextChord: a jump mid-run plays the chosen chord next', () => {
  const prog = { chords: [3, 5, 7, 9], pos: 0, fresh: false };
  Object.assign(prog, { pos: 2, fresh: true });
  assert.deepEqual([0, 1].map(() => M.nextChord(prog, true)), [2, 3]);
});

// ---- data checks on tunings.js ----

for (const def of TUNINGS) {
  test(`${def.name}: notes are valid and the top runs low to high`, () => {
    const T = M.buildTuning(def);
    const top = T.notes.filter((o) => o.side === 'top' && !o.isDing).map((o) => o.midi);
    assert.deepEqual(top, [...top].sort((a, b) => a - b));
    assert.equal(new Set(T.notes.map((o) => o.name)).size, T.notes.length, 'duplicate note');
  });

  test(`${def.name}: its own progressions resolve and every progression uses its chords`, () => {
    const T = M.buildTuning(def);
    for (const p of def.progressions || []) assert.ok(T.progressions.some((q) => q.name === p.name), `"${p.name}" names a chord this tuning does not have`);
    for (const p of T.progressions) assert.ok(p.chords.every((i) => T.selections[i] && !T.selections[i].scale), p.name);
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
  for (const p of PATTERNS.filter((q) => !q.arpeggio)) assert.ok(fit.has(p.name), p.name);
});

test('arpeggios: offered over chords and progressions, not over the scale', () => {
  const T = tuning('d-kurd-9');
  const arps = PATTERNS.filter((p) => p.arpeggio).map((p) => p.name);
  assert.ok(arps.length >= 6);
  const onScale = M.patternsFor(T, 0, PATTERNS).patterns.map((p) => p.name);
  const dm = T.selections.findIndex((s) => s.name === 'Dm');
  const onChord = M.patternsFor(T, dm, PATTERNS).patterns.map((p) => p.name);
  const { chords } = T.progressions[0];
  const inProg = M.patternsFor(T, chords[0], PATTERNS, chords).patterns.map((p) => p.name);
  for (const a of arps) {
    assert.ok(!onScale.includes(a), a);
    assert.ok(onChord.includes(a), a);
    assert.ok(inProg.includes(a), a);
  }
});

test('arpeggios: Arpeggio up plays every chord note on the pan, top and bottom', () => {
  const T = tuning('b-hijaz');
  const am = T.selections.findIndex((s) => s.name === 'Am');
  const up = M.patternsFor(T, am, PATTERNS).patterns.find((p) => p.name === 'Arpeggio up');
  assert.equal(played(up.parsed), 'A3 C4 E4 A4 E5 . . .');
});

test('arpeggios never strike the same note twice in a row, on any chord', () => {
  for (const def of TUNINGS) {
    const T = M.buildTuning(def);
    T.selections.forEach((sel, i) => {
      if (sel.scale) return;
      for (const p of M.patternsFor(T, i, PATTERNS).patterns.filter((q) => q.arpeggio)) {
        const notes = p.parsed.filter((s) => s.kind === 'notes').map((s) => s.notes.map((o) => o.name).join('+'));
        notes.forEach((n, k) => assert.ok(k === 0 || n !== notes[k - 1], `${def.name} ${sel.name} ${p.name}: ${n} twice`));
      }
    });
  }
});

test('arpeggios play only chord notes', () => {
  const T = tuning('d-kurd-9');
  const dm = T.selections.findIndex((s) => s.name === 'Dm');
  const { patterns } = M.patternsFor(T, dm, PATTERNS);
  const dmPcs = T.selections[dm].pcs;
  for (const p of patterns.filter((q) => q.arpeggio)) {
    for (const s of p.parsed.filter((x) => x.kind === 'notes')) {
      for (const o of s.notes) assert.ok(dmPcs.includes(M.pc(o.midi)), `${p.name}: ${o.name}`);
    }
  }
});

test('B Hijaz own patterns play the same notes as before pitch-order numbering', () => {
  const T = tuning('b-hijaz');
  const { patterns } = M.patternsFor(T, 0, PATTERNS);
  const get = (name) => played(patterns.find((p) => p.name === name).parsed);
  assert.equal(get('Snake charmer'), 'B2 B3 C4 B3 D#4 C4 B3 . B3 C4 E4 D#4 C4 B3 C4 .');
  assert.equal(get('Waterfall'), 'E5 Eb5 B4 A4 G4 F#4 E4 D#4 C4 B3 B2 . . . . .');
});

// ---- playback position ----

// Like the player: advance first, then read the (possibly swapped) steps.
const advance = (play, latest, loop) => { const i = M.nextStep(play, latest, loop); return play.steps[i]; };

test('patternsFor: every run is a whole number of beat pairs', () => {
  for (const def of TUNINGS) {
    const T = M.buildTuning(def);
    T.selections.forEach((sel, i) => {
      for (const p of M.patternsFor(T, i, PATTERNS).patterns) assert.equal(p.parsed.length % 4, 0, `${def.name} ${sel.name} ${p.name}: ${p.parsed.length} steps`);
    });
  }
});

test('patternsFor: in a progression every chord gets a run of the same length', () => {
  const T = tuning('b-hijaz');
  const prog = T.progressions.find((p) => p.name === 'Hijaz cadence');
  const lengths = (name) => prog.chords.map((i) => M.patternsFor(T, i, PATTERNS, prog.chords).patterns.find((p) => p.name === name).parsed.length);
  for (const name of ['Full ascent', 'Arpeggio up', 'Arpeggio up and down']) {
    const ls = lengths(name);
    assert.equal(new Set(ls).size, 1, `${name}: ${ls}`);
  }
  // Full ascent on B alone: ding, seven chord notes and three rests is 11
  // steps, padded to 12. In the progression B7 has nine notes (13 steps,
  // padded to 16), so every chord gets 16.
  const b = T.selections.findIndex((s) => s.name === 'B');
  assert.equal(M.patternsFor(T, b, PATTERNS).patterns.find((p) => p.name === 'Full ascent').parsed.length, 12);
  assert.equal(lengths('Full ascent')[0], 16);
});

test('nextStep: plays through and loops back to beat 1', () => {
  const steps = ['a', 'b', 'c'];
  const play = { steps, next: 0 };
  const order = [];
  for (let k = 0; k < 7; k++) order.push(advance(play, steps, true));
  assert.deepEqual(order, ['a', 'b', 'c', 'a', 'b', 'c', 'a']);
});

test('nextStep: stops at the end without loop', () => {
  const steps = ['a', 'b'];
  const play = { steps, next: 0 };
  assert.equal(M.nextStep(play, steps, false), 0);
  assert.equal(M.nextStep(play, steps, false), 1);
  assert.equal(M.nextStep(play, steps, false), -1);
});

test('nextStep: a switch mid-run waits for beat 1', () => {
  const old = ['o1', 'o2', 'o3', 'o4'];
  const fresh = ['n1', 'n2'];
  const play = { steps: old, next: 0 };
  const order = [];
  order.push(advance(play, old, true));
  for (let k = 0; k < 6; k++) order.push(advance(play, fresh, true));
  assert.deepEqual(order, ['o1', 'o2', 'o3', 'o4', 'n1', 'n2', 'n1']);
});

test('nextStep: starting from a step plays that run before picking up a switch', () => {
  const old = ['o1', 'o2', 'o3'];
  const fresh = ['n1', 'n2', 'n3'];
  const play = { steps: old, next: 1 };
  const order = [];
  for (let k = 0; k < 3; k++) order.push(advance(play, fresh, true));
  assert.deepEqual(order, ['o2', 'o3', 'n1']);
});
