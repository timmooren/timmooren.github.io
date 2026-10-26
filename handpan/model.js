// Handpan model: notes, tunings, chords and pattern parsing. No DOM or audio,
// so it runs in the browser (window.HandpanModel) and in Node tests.
(function (root) {
  'use strict';

  const CX = 170, CY = 165, RING = 114, SHELL = 158, DING_R = 44;

  const NOTE_RE = /^([A-G])(#|b)?(-?\d)$/;
  const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function toMidi(name) {
    const m = NOTE_RE.exec(name);
    if (!m) throw new Error('Bad note ' + name);
    return 12 * (Number(m[3]) + 1) + LETTER_PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }
  const pc = (midi) => ((midi % 12) + 12) % 12;
  const pitchClass = (name) => name.replace(/-?\d$/, '');
  // Tone field size follows pitch: low notes need big fields.
  const fieldRadius = (midi) => Math.min(38, Math.max(22, 37 - (midi - 51) * 0.58));

  const CHORD_TYPES = [
    { suffix: '', label: 'major', iv: [0, 4, 7], desc: 'Bright and settled.' },
    { suffix: 'm', label: 'minor', iv: [0, 3, 7], desc: 'Soft and introspective.' },
    { suffix: 'sus2', label: 'sus2', iv: [0, 2, 7], desc: 'Open and floating; neither major nor minor.' },
    { suffix: 'dim', label: 'diminished', iv: [0, 3, 6], desc: 'Unstable; wants to resolve.' },
    { suffix: '7', label: 'dominant 7th', iv: [0, 4, 7, 10], desc: 'Tension that pulls toward a resolution.' },
    { suffix: 'm7', label: 'minor 7th', iv: [0, 3, 7, 10], desc: 'Mellow and jazzy.' },
  ];

  // Chord progressions, as chord roots in semitones above the ding. Each
  // root takes the tuning's own chord on it (a triad if there is one), so
  // the same progression comes out minor on a minor pan and major on a major
  // one. A tuning can add its own with chord names (see tunings.js).
  const PROGRESSIONS = [
    { name: 'Two-step', roots: [0, 10], desc: 'Rock between home and the chord a step below. The backbone of countless handpan jams.' },
    { name: 'Home and away', roots: [0, 7], desc: 'Home and the fifth: the simplest pull and release.' },
    { name: 'Relative', roots: [0, 3], desc: 'Minor home and its relative major: same notes, a different light.' },
    { name: 'Drift', roots: [0, 8], desc: 'Home and the chord a sixth up. Wide and wistful.' },
    { name: 'Epic', roots: [0, 8, 10, 0], desc: 'Climbs two steps and lands back home, like a film score.' },
    { name: 'Andalusian', roots: [0, 10, 8, 7], desc: 'Falls step by step to the fifth, which pulls back home.' },
    { name: 'Minor pop', roots: [0, 8, 3, 10], desc: 'The four chords behind a thousand ballads.' },
    { name: 'Pop', roots: [0, 7, 9, 5], desc: 'The four chords behind a thousand pop songs.' },
    { name: 'Doo-wop', roots: [0, 9, 5, 7], desc: 'The fifties ballad loop: the fifth at the end leads straight back home.' },
    { name: 'Folk', roots: [0, 5, 0, 7], desc: 'Home, four, home, five: the shape of countless folk tunes.' },
  ];

  // ---------- model ----------
  function buildTuning(def) {
    const notes = [];
    notes.push({ name: def.ding, midi: toMidi(def.ding), side: 'top', x: CX, y: CY, r: DING_R, num: 'D', isDing: true });
    const n = def.top.length;
    const step = 360 / n;
    def.top.forEach((name, i) => {
      // Zig-zag: lowest field toward the player, then alternate right/left going up.
      const a = (90 + (i % 2 === 1 ? 1 : -1) * step * Math.ceil(i / 2)) * Math.PI / 180;
      const midi = toMidi(name);
      notes.push({ name, midi, side: 'top', x: CX + RING * Math.cos(a), y: CY + RING * Math.sin(a), r: fieldRadius(midi), num: String(i + 1) });
    });
    (def.bottom || []).forEach(([name, deg]) => {
      const a = deg * Math.PI / 180;
      const midi = toMidi(name);
      notes.push({ name, midi, side: 'bottom', x: CX + RING * Math.cos(a), y: CY + RING * Math.sin(a), r: fieldRadius(midi), num: '' });
    });

    const pcs = [...new Set(notes.map((o) => pc(o.midi)))];
    const spell = (p) => pitchClass(notes.find((o) => pc(o.midi) === p).name);
    const dingPc = pc(notes[0].midi);

    let selections = def.selections;
    if (!selections) {
      selections = [{
        name: def.name + ' scale',
        scale: true,
        root: dingPc,
        pcs,
        desc: 'Every note on the instrument. Start and end on the ding to hear the key.',
      }];
      const found = [];
      // Walk pitch classes starting from the ding so the home chord comes first.
      const ordered = pcs.slice().sort((a, b) => ((a - dingPc + 12) % 12) - ((b - dingPc + 12) % 12));
      CHORD_TYPES.forEach((type, ti) => {
        ordered.forEach((root) => {
          const chordPcs = type.iv.map((iv) => (root + iv) % 12);
          if (chordPcs.every((p) => pcs.includes(p))) found.push({ type, ti, root, chordPcs });
        });
      });
      found.sort((a, b) => (b.root === dingPc) - (a.root === dingPc) || a.ti - b.ti);
      found.slice(0, 9).forEach(({ type, root, chordPcs }) => {
        const names = chordPcs.map(spell).join(' ');
        const home = root === dingPc && type.iv.length === 3 ? ' This is the home chord; end phrases here.' : '';
        selections.push({ name: spell(root) + type.suffix, root, pcs: chordPcs, desc: names + '. ' + type.desc + home });
      });
    }

    return { def, notes, selections, dingPc, progressions: buildProgressions(def, selections, dingPc) };
  }

  // Progressions that fit a tuning: [{ name, chords: [selection index], desc }].
  // Generic ones are skipped when a root has no chord, and so are ones that
  // come out the same as one already listed.
  function buildProgressions(def, selections, dingPc) {
    const onRoot = (root) => {
      const chords = selections.map((s, i) => ({ s, i })).filter(({ s }) => !s.scale && s.root === root);
      const triad = chords.find(({ s }) => s.pcs.length === 3) || chords[0];
      return triad ? triad.i : -1;
    };
    const own = (def.progressions || []).map((p) => ({
      name: p.name, desc: p.desc, own: true, chords: p.chords.map((n) => selections.findIndex((s) => s.name === n)),
    }));
    const generic = PROGRESSIONS.map((p) => ({
      name: p.name, desc: p.desc, chords: p.roots.map((r) => onRoot((dingPc + r) % 12)),
    }));
    const seen = new Set();
    return own.concat(generic).filter((p) => {
      const key = p.chords.join(' ');
      if (p.chords.includes(-1) || new Set(p.chords).size < 2 || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Returns [{kind:'notes'|'tak'|'rest', notes:[note], hand}] or null if the
  // pattern doesn't fit. Numbers pick from `degrees` (the numbered notes of
  // what you play over); with `wrap`, numbers past the end wrap around.
  function parsePattern(src, notes, degrees, wrap) {
    const N = degrees.length;
    if (!N) return null;
    const num = (t) => (t === 'N' ? N : t.startsWith('N-') ? N - Number(t.slice(2)) : Number(t));
    const tokens = [];
    for (const tok of src.trim().split(/\s+/)) {
      // N on its own is the highest numbered note, N-1 the one below it.
      if (/^N(?:-\d+)?$/.test(tok)) { tokens.push(String(num(tok))); continue; }
      const m = /^(\d+|N(?:-\d+)?)\.\.(\d+|N(?:-\d+)?)$/.exec(tok);
      if (!m) { tokens.push(tok); continue; }
      // Ranges starting at N run down (and are empty if there is no room).
      const a = num(m[1]), b = num(m[2]);
      if (m[1][0] === 'N') { for (let i = a; i >= b; i--) tokens.push(String(i)); }
      else { for (let i = a; i <= b; i++) tokens.push(String(i)); }
    }
    const steps = [];
    for (const tok of tokens) {
      if (tok === '.') { steps.push({ kind: 'rest' }); continue; }
      if (tok === 'T') { steps.push({ kind: 'tak' }); continue; }
      const group = [];
      for (const part of tok.split('+')) {
        let note;
        if (part === 'D') note = notes[0];
        else if (/^\d+$/.test(part)) {
          const idx = Number(part);
          if (idx < 1 || (idx > N && !wrap)) return null;
          // Wrapping can land on a note already in this strike (1+4 on a
          // three-note chord is 1+1); move on to the next unused one.
          for (let k = 0; k < N; k++) {
            note = degrees[(idx - 1 + k) % N];
            if (!group.includes(note)) break;
          }
        } else note = notes.find((o) => o.name === part);
        if (!note) return null;
        if (!group.includes(note)) group.push(note);
      }
      steps.push({ kind: 'notes', notes: group });
    }
    // Alternate hands across struck steps; simultaneous strikes use both.
    let right = true;
    steps.forEach((s) => {
      if (s.kind === 'rest') return;
      if (s.kind === 'notes' && s.notes.length > 1) { s.hand = 'R+L'; right = true; return; }
      s.hand = right ? 'R' : 'L';
      right = !right;
    });
    return steps;
  }

  // ----- what you play over, and the patterns built on it -----
  function selectionMembers(sel, T) {
    return T.notes.filter((o) => sel.pcs.includes(pc(o.midi))).sort((a, b) => a.midi - b.midi);
  }

  // Numbered notes: the scale's or chord's notes anywhere on the pan, low to
  // high. The ding is always D.
  function degreesFor(sel, T) {
    return selectionMembers(sel, T).filter((o) => !o.isDing);
  }

  // The patterns that fit a tuning when playing over one of its selections.
  // A tuning's own patterns (`own`) are written for its scale, so they only
  // appear there; the generic ones (`shared`) adapt to anything.
  // Whether a pattern plays any numbered notes. One that only uses the ding
  // and taks sounds the same over every chord.
  const usesChordNotes = (p) => /(^|[\s+])(\d+|N)(?=$|[\s+.])/.test(p.steps);

  // Steps are eighth notes. A run is padded with rests to whole pairs of
  // beats (4 steps), and to at least `min` steps, so a loop always lands on
  // a beat: `1..N` on a seven-note chord would otherwise make an 11-step run.
  const BEAT_PAIR = 4;
  function padRun(steps, min) {
    const len = Math.ceil(Math.max(steps.length, min || 0) / BEAT_PAIR) * BEAT_PAIR;
    return steps.concat(Array.from({ length: len - steps.length }, () => ({ kind: 'rest' })));
  }

  // In a progression, pass its chords as `within`: only patterns that fit
  // every one of them are kept, so the progression never stops halfway, and
  // that use chord notes, so you can hear the chords change. Each run is
  // padded to the longest run among the chords, so every chord lasts as long
  // as the others and the changes come round evenly.
  function patternsFor(T, selIndex, shared, within) {
    const sel = T.selections[selIndex];
    const degrees = degreesFor(sel, T);
    const own = (T.def.patterns || []).filter((p) => sel.scale || !p.scaleOnly).map((p) => Object.assign({ own: true }, p));
    // Arpeggios break a chord into its notes, so they need a chord.
    let patterns = own.concat(shared.filter((p) => !(sel.scale && p.arpeggio)))
      .map((p) => Object.assign({}, p, { parsed: parsePattern(p.steps, T.notes, degrees, !sel.scale) }))
      .filter((p) => p.parsed);
    const longest = new Map();
    if (within) {
      const others = within.filter((i) => i !== selIndex).map((i) => new Map(patternsFor(T, i, shared).patterns.map((p) => [p.name, p.parsed.length])));
      patterns = patterns.filter((p) => usesChordNotes(p) && others.every((lengths) => lengths.has(p.name)));
      others.forEach((lengths) => lengths.forEach((len, name) => longest.set(name, Math.max(longest.get(name) || 0, len))));
    }
    patterns.forEach((p) => { p.parsed = padRun(p.parsed, longest.get(p.name)); });
    return { degrees, patterns };
  }

  // Playback position: `play` is { steps, next }. Returns the index in
  // play.steps to sound now, or -1 when a pattern without loop has ended.
  // `latest` (the pattern's steps on the current scale, chord or tuning) is
  // only picked up on beat 1, so a switch lets the running sequence finish.
  function nextStep(play, latest, loop) {
    if (play.next >= play.steps.length) {
      if (!loop) return -1;
      play.next = 0;
    }
    if (play.next === 0) play.steps = latest;
    return play.next++;
  }

  // Which chord of a progression the next run plays over, called on beat 1.
  // `prog` is { chords, pos, fresh }: it moves on one chord per run, except
  // that a progression just picked or jumped into (`fresh`) starts where it
  // is. Returns the position, or -1 once a progression without loop has
  // played its last chord.
  function nextChord(prog, loop) {
    if (prog.fresh) { prog.fresh = false; return prog.pos; }
    if (prog.pos + 1 >= prog.chords.length && !loop) return -1;
    prog.pos = (prog.pos + 1) % prog.chords.length;
    return prog.pos;
  }

  const api = {
    CX, CY, RING, SHELL, DING_R, CHORD_TYPES, PROGRESSIONS,
    toMidi, pc, pitchClass, fieldRadius, buildTuning, parsePattern,
    selectionMembers, degreesFor, usesChordNotes, patternsFor, nextStep, nextChord,
  };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HandpanModel = api;
})(this);
