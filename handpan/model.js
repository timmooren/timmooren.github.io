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

    return { def, notes, selections, dingPc };
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
  function patternsFor(T, selIndex, shared) {
    const sel = T.selections[selIndex];
    const degrees = degreesFor(sel, T);
    const own = (T.def.patterns || []).filter((p) => sel.scale || !p.scaleOnly).map((p) => Object.assign({ own: true }, p));
    const patterns = own.concat(shared)
      .map((p) => Object.assign({}, p, { parsed: parsePattern(p.steps, T.notes, degrees, !sel.scale) }))
      .filter((p) => p.parsed);
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

  const api = {
    CX, CY, RING, SHELL, DING_R, CHORD_TYPES,
    toMidi, pc, pitchClass, fieldRadius, buildTuning, parsePattern,
    selectionMembers, degreesFor, patternsFor, nextStep,
  };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HandpanModel = api;
})(this);
