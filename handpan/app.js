(function () {
  'use strict';

  const TUNINGS = window.HANDPAN_TUNINGS;
  const PATTERNS = window.HANDPAN_PATTERNS;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const CX = 170, CY = 165, RING = 114, SHELL = 158, DING_R = 44;
  const STORE = 'handpan.';

  const $ = (id) => document.getElementById(id);

  // ---------- storage (best effort) ----------
  function load(key, fallback) {
    try { const v = localStorage.getItem(STORE + key); return v === null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(STORE + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  // ---------- music helpers ----------
  const NOTE_RE = /^([A-G])(#|b)?(-?\d)$/;
  const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function toMidi(name) {
    const m = NOTE_RE.exec(name);
    if (!m) throw new Error('Bad note ' + name);
    return 12 * (Number(m[3]) + 1) + LETTER_PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }
  const pc = (midi) => ((midi % 12) + 12) % 12;
  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
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
          note = degrees[(idx - 1) % N];
        } else note = notes.find((o) => o.name === part);
        if (!note) return null;
        group.push(note);
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

  // ---------- audio ----------
  const audio = {
    ctx: null, master: null, wet: null, noise: null, symp: null, voices: null,
    volume: load('volume', 80), muted: load('muted', false),
  };

  function ac() {
    if (!audio.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 14; comp.ratio.value = 3.5;
      comp.attack.value = 0.004; comp.release.value = 0.25;
      comp.connect(ctx.destination);
      const master = ctx.createGain();
      master.connect(comp);
      const verb = ctx.createConvolver();
      verb.buffer = impulse(ctx, 3.2);
      const wet = ctx.createGain();
      wet.gain.value = 0.3;
      wet.connect(verb); verb.connect(master);
      const noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const symp = ctx.createGain();
      symp.connect(master); symp.connect(wet);
      Object.assign(audio, { ctx, master, wet, noise, symp, voices: new Map() });
      applyVolume();
    }
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    return audio.ctx;
  }

  // A warm room: a few early reflections, then a diffuse tail that loses its
  // highs as it decays (a one-pole lowpass whose cutoff falls over time).
  function impulse(ctx, seconds) {
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * seconds);
    const pre = Math.floor(sr * 0.012);
    const buf = ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      let lp = 0;
      for (let i = pre; i < len; i++) {
        const t = (i - pre) / sr;
        const k = 0.55 * Math.exp(-t * 2.2) + 0.04;
        lp += k * ((Math.random() * 2 - 1) - lp);
        d[i] = lp * Math.exp(-t * 2.4);
      }
      [0.017, 0.023, 0.031, 0.043, 0.057].forEach((s, j) => {
        const at = Math.floor(sr * (s + c * 0.0021));
        if (at < len) d[at] += (j % 2 ? -1 : 1) * 0.5 * Math.pow(0.7, j);
      });
    }
    return buf;
  }

  function applyVolume() {
    if (!audio.master) return;
    const v = audio.muted ? 0 : Math.pow(audio.volume / 100, 1.5) * 0.9;
    audio.master.gain.setTargetAtTime(v, audio.ctx.currentTime, 0.02);
  }

  function out(node) { node.connect(audio.master); node.connect(audio.wet); }

  // One decaying sine partial. `glide` starts the pitch slightly sharp: the
  // steel is stiffer for a moment right after the strike.
  function partial(ctx, dest, freq, amp, t0, t60, attack, glide) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(freq * (1 + (glide || 0)), t0);
    if (glide) o.frequency.setTargetAtTime(freq, t0, 0.025);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(amp, t0 + attack);
    g.gain.setTargetAtTime(0, t0 + attack, t60 / 6.9);
    o.connect(g); g.connect(dest);
    o.start(t0); o.stop(t0 + attack + t60);
  }

  function noiseBurst(ctx, dest, t0, type, freq, q, amp, decay) {
    const src = ctx.createBufferSource();
    src.buffer = audio.noise;
    src.playbackRate.value = 0.9 + Math.random() * 0.2;
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(amp, t0);
    g.gain.setTargetAtTime(0, t0, decay / 4);
    src.connect(f); f.connect(g); g.connect(dest);
    src.start(t0); src.stop(t0 + decay * 1.5);
  }

  // Other tone fields ring along quietly when they share partials with the
  // struck note: octaves most, fifths and twelfths a little.
  function sympathetic(ctx, midi, t0, vel) {
    if (!state.tuning) return;
    const picked = [];
    state.tuning.notes.forEach((o) => {
      const iv = Math.abs(o.midi - midi);
      if (iv === 0) return;
      const amp = iv % 12 === 0 ? 0.05 : iv === 7 || iv === 19 ? 0.025 : 0;
      if (amp) picked.push([o.midi, amp / (1 + Math.floor(iv / 12) * 0.5)]);
    });
    // Capped at three, single partial each, to stay light on phones.
    picked.sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([m, amp]) => {
      partial(ctx, audio.symp, hz(m), amp * vel, t0 + 0.01, ringTime(m) * 0.7, 0.12);
    });
  }

  // Low notes sustain far longer than high ones.
  function ringTime(midi) { return Math.min(9, Math.max(2.6, 9 - (midi - 47) * 0.22)); }

  // A handpan note. Each tone field is tuned so its fundamental, octave and
  // compound fifth line up; each partial is a near-degenerate pair that beats
  // slowly (the shimmer). A lowpass that closes after the strike makes it go
  // from bright to mellow, and harder hits are brighter.
  function strike(midi, when, velocity) {
    const ctx = ac();
    const t0 = Math.max(when || 0, ctx.currentTime);
    const vel = (velocity || 1) * (0.92 + Math.random() * 0.12);
    const f = hz(midi);
    const t60 = ringTime(midi);
    const isDing = state.tuning && state.tuning.notes[0].midi === midi;

    // Restriking a ringing field partly damps what was there.
    const prev = audio.voices.get(midi);
    if (prev && prev.end > t0) {
      prev.gain.gain.cancelScheduledValues(t0);
      prev.gain.gain.setTargetAtTime(0.25, t0, 0.015);
    }

    const voice = ctx.createGain();
    voice.gain.value = 1;
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.Q.value = 0.4;
    const open = Math.min(16000, f * (6 + 10 * vel));
    tone.frequency.setValueAtTime(open, t0);
    tone.frequency.setTargetAtTime(Math.max(f * 3.2, 900), t0 + 0.005, 0.12);
    const body = ctx.createGain();
    body.gain.value = 0.3 * vel;
    tone.connect(body); body.connect(voice);
    // Place the note left/right where its field sits for the player. Bottom
    // fields are stored as seen from below, so flip them to the player's view
    // (the same as the Mirror view); the toggle only changes the drawing.
    const field = state.tuning && state.tuning.notes.find((o) => o.midi === midi);
    if (field && ctx.createStereoPanner) {
      const x = field.side === 'bottom' ? 2 * CX - field.x : field.x;
      const pan = ctx.createStereoPanner();
      pan.pan.value = ((x - CX) / SHELL) * 0.45;
      voice.connect(pan); out(pan);
    } else out(voice);

    const beat = 0.0006 + Math.random() * 0.0005;
    partial(ctx, tone, f, 0.62, t0, t60, 0.004, 0.0035);
    partial(ctx, tone, f * (1 + beat), 0.38, t0, t60 * 0.92, 0.004, 0.0035);
    partial(ctx, tone, f * 2.0008, 0.32 * vel, t0, t60 * 0.6, 0.003, 0.003);
    partial(ctx, tone, f * 2.0008 * (1 + beat * 1.6), 0.18 * vel, t0, t60 * 0.55, 0.003, 0.003);
    partial(ctx, tone, f * 2.9985, 0.16 * vel, t0, t60 * 0.38, 0.003, 0.002);
    // Untuned shell modes: quiet, short, and what makes it sound like steel.
    partial(ctx, tone, f * 3.93, 0.035 * vel, t0, 0.5, 0.002);
    partial(ctx, tone, f * 5.41, 0.022 * vel, t0, 0.28, 0.002);

    // The finger: a soft thud plus a brief bright contact noise.
    noiseBurst(ctx, voice, t0, 'lowpass', 380, 0.7, 0.16 * vel, 0.035);
    noiseBurst(ctx, voice, t0, 'bandpass', Math.min(9000, f * 7), 1.2, 0.05 * vel, 0.018);

    if (isDing) {
      // The cavity under the ding (Helmholtz resonance) adds a breathy boom.
      noiseBurst(ctx, voice, t0, 'bandpass', f, 9, 0.5 * vel, 0.35);
      partial(ctx, voice, f * 0.995, 0.08 * vel, t0, 0.9, 0.02);
    }

    sympathetic(ctx, midi, t0, vel);
    audio.voices.set(midi, { gain: voice, end: t0 + t60 });
  }

  // A tak: a fingertip on the shell between fields. A sharp contact click,
  // a short metallic ring from the shell's own (untuned) modes, a small pop
  // from the air cavity, and the nearest fields humming faintly. Every tak is
  // slightly different so repeated ones don't sound machine-made.
  // `where` is {x, y, side} in pan coordinates, or {hand: 'R'|'L'}.
  function tak(when, where) {
    const ctx = ac();
    const t0 = Math.max(when || 0, ctx.currentTime);
    const T = state.tuning;
    const jit = () => 0.94 + Math.random() * 0.12;
    const vel = 0.85 + Math.random() * 0.25;
    where = where || {};

    // Where on the pan: the tapped spot, else a spot near the rim on the
    // side of the hand that plays it.
    let x = where.x, y = where.y;
    if (x === undefined) {
      const side = where.hand === 'L' ? -1 : 1;
      const a = (90 - side * (35 + Math.random() * 40)) * Math.PI / 180;
      x = CX + SHELL * 0.85 * Math.cos(a);
      y = CY + SHELL * 0.85 * Math.sin(a);
    }
    const playerX = where.side === 'bottom' ? 2 * CX - x : x;

    const g = ctx.createGain();
    g.gain.value = vel * 1.5;
    if (ctx.createStereoPanner) {
      const pan = ctx.createStereoPanner();
      pan.pan.value = Math.max(-0.6, Math.min(0.6, ((playerX - CX) / SHELL) * 0.55));
      g.connect(pan); out(pan);
    } else out(g);

    // Contact click and the fingertip's soft thud.
    noiseBurst(ctx, g, t0, 'highpass', 3500 * jit(), 0.7, 0.3, 0.006);
    noiseBurst(ctx, g, t0, 'bandpass', 1100 * jit(), 1.6, 0.22, 0.025);
    noiseBurst(ctx, g, t0, 'lowpass', 300, 0.7, 0.18, 0.03);

    // Shell modes: inharmonic, bright, gone within a fifth of a second.
    const base = 1250 * jit();
    [[1, 0.05, 0.2], [1.57, 0.042, 0.15], [2.31, 0.032, 0.11], [3.17, 0.022, 0.08], [4.43, 0.014, 0.05]].forEach(([r, amp, t60]) => {
      partial(ctx, g, base * r * jit(), amp, t0, t60 * jit(), 0.0015);
    });

    if (T) {
      // Cavity pop near the ding's pitch.
      partial(ctx, g, hz(T.notes[0].midi) * 1.02, 0.05, t0, 0.18, 0.004);
      // The two nearest fields hum faintly.
      T.notes
        .filter((o) => o.side === (where.side || 'top'))
        .map((o) => ({ o, d: Math.hypot(o.x - x, o.y - y) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
        .forEach(({ o }, i) => partial(ctx, g, hz(o.midi), (i ? 0.006 : 0.012), t0 + 0.002, ringTime(o.midi) * 0.25, 0.01));
    }
  }

  // Run fn when the audio clock reaches `when`, so visuals line up with sound.
  function at(when, fn) {
    const ms = Math.max(0, (when - audio.ctx.currentTime) * 1000);
    return setTimeout(fn, ms);
  }

  // ---------- state ----------
  const state = {
    tuning: null,
    selIndex: 0, // what you play over: the scale or a chord
    degrees: [], // its numbered notes, low to high
    patterns: [], // patterns built on those notes
    patName: null,
    level: load('level', 'Beginner'),
    mirrored: load('mirrored', false),
    tempo: load('tempo', 88),
    loop: load('loop', true),
    playing: null, // { timers, interval, next, time }
  };

  // ---------- rendering ----------
  function el(name, attrs, parent) {
    const node = document.createElementNS(SVG_NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function drawShell(svg, side) {
    svg.textContent = '';
    const defs = el('defs', {}, svg);
    const grad = el('radialGradient', { id: 'shell-' + side, cx: '42%', cy: '36%', r: '70%' }, defs);
    el('stop', { offset: '0%', 'stop-color': 'var(--shell-hi)' }, grad);
    el('stop', { offset: '70%', 'stop-color': 'var(--shell)' }, grad);
    el('stop', { offset: '100%', 'stop-color': 'var(--shell-lo)' }, grad);
    const shell = el('circle', { cx: CX, cy: CY, r: SHELL, fill: 'url(#shell-' + side + ')', class: 'shell' }, svg);
    shell.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      stopPlayback();
      const p = ripple(svg, e);
      // Undo the mirror so the position is in the field coordinates.
      const x = side === 'bottom' && state.mirrored ? 2 * CX - p.x : p.x;
      tak(0, { x, y: p.y, side });
    });
    if (side === 'bottom') {
      el('circle', { cx: CX, cy: CY, r: 38, class: 'port' }, svg);
      const t = el('text', { x: CX, y: CY + 4, class: 'port-label', 'text-anchor': 'middle' }, svg);
      t.textContent = 'port';
    }
    return el('g', {}, svg);
  }

  function ripple(svg, e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const r = el('circle', { cx: p.x, cy: p.y, r: 6, class: 'ripple' }, svg);
    setTimeout(() => r.remove(), 500);
    return p;
  }

  function renderInstrument() {
    const T = state.tuning;
    const hasBottom = T.notes.some((o) => o.side === 'bottom');
    const layers = { top: drawShell($('svg-top'), 'top') };
    $('fig-bottom').hidden = !hasBottom;
    $('pans').classList.toggle('single', !hasBottom);
    if (hasBottom) layers.bottom = drawShell($('svg-bottom'), 'bottom');
    else $('svg-bottom').textContent = '';

    T.notes.forEach((o) => {
      const g = el('g', { class: 'field' + (o.isDing ? ' ding' : ''), tabindex: '0', role: 'button', 'aria-label': (o.isDing ? 'Ding ' : '') + o.name }, layers[o.side]);
      o.circle = el('circle', { r: o.r }, g);
      o.ring = el('circle', { r: o.r * 0.55, class: 'dimple' }, g);
      o.fs = o.r > 40 ? 17 : o.r > 30 ? 14 : 12;
      o.label = el('text', { 'text-anchor': 'middle', class: 'note-label', 'font-size': o.fs }, g);
      o.label.textContent = o.name;
      o.numLabel = el('text', { 'text-anchor': 'middle', class: 'note-num', 'font-size': 10 }, g);
      o.g = g;
      const hit = (e) => { e.preventDefault(); stopPlayback(); strike(o.midi); flash(o); };
      g.addEventListener('pointerdown', (e) => { e.stopPropagation(); hit(e); });
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); hit(e); } });
    });
    layout();
  }

  function layout() {
    state.tuning.notes.forEach((o) => {
      const x = o.side === 'bottom' && state.mirrored ? 2 * CX - o.x : o.x;
      ['circle', 'ring'].forEach((k) => { o[k].setAttribute('cx', x); o[k].setAttribute('cy', o.y); });
      o.label.setAttribute('x', x);
      o.label.setAttribute('y', o.y + o.fs * 0.35 - (o.dispNum ? 4 : 0));
      o.numLabel.setAttribute('x', x);
      o.numLabel.setAttribute('y', o.y + o.fs * 0.35 + 9);
    });
    $('bottom-view').textContent = state.mirrored ? 'Bottom, seen through the top' : 'Bottom, seen from below';
    $('btn-mirror').setAttribute('aria-pressed', String(state.mirrored));
  }

  function flash(o) {
    o.g.classList.remove('hit');
    void o.g.getBoundingClientRect();
    o.g.classList.add('hit');
    clearTimeout(o.flashTimer);
    o.flashTimer = setTimeout(() => o.g.classList.remove('hit'), 420);
  }

  function renderHeader() {
    const T = state.tuning;
    $('tuning-name').textContent = T.def.name;
    const top = T.def.top.join(' ');
    const bottom = T.def.bottom ? T.def.bottom.map((b) => b[0]).join(' ') : '';
    $('tuning-notes').textContent = '';
    const parts = [['Ding', T.def.ding], ['Top', top]];
    if (bottom) parts.push(['Bottom', bottom]);
    parts.forEach(([k, v]) => {
      const span = document.createElement('span');
      const b = document.createElement('b');
      b.textContent = k;
      span.append(b, ' ' + v);
      $('tuning-notes').appendChild(span);
    });
    $('tuning-mood').textContent = T.def.mood;
    const count = T.notes.length;
    document.title = T.def.name + ' Handpan';
    $('svg-top').setAttribute('aria-label', 'Top of ' + T.def.name + ' handpan, ' + count + ' notes in total');
  }

  // ----- what you play over, and the patterns built on it -----
  function selectionMembers(sel) {
    return state.tuning.notes.filter((o) => sel.pcs.includes(pc(o.midi))).sort((a, b) => a.midi - b.midi);
  }

  // Numbered notes: the top tone fields for the scale; for a chord, its
  // notes anywhere on the pan. The ding is always D.
  function degreesFor(sel) {
    const T = state.tuning;
    if (sel.scale) return T.notes.filter((o) => o.side === 'top' && !o.isDing);
    return selectionMembers(sel).filter((o) => !o.isDing);
  }

  function buildPatterns() {
    const T = state.tuning;
    const sel = T.selections[state.selIndex];
    state.degrees = degreesFor(sel);
    // A tuning's own patterns are written for its scale, so only show them there.
    state.patterns = (T.def.patterns || []).filter((p) => sel.scale || !p.scaleOnly).concat(PATTERNS)
      .map((p) => Object.assign({}, p, { parsed: parsePattern(p.steps, T.notes, state.degrees, !sel.scale) }))
      .filter((p) => p.parsed);
  }

  function currentPattern() {
    return state.patterns.find((p) => p.name === state.patName) || state.patterns[0];
  }

  // Pattern dropdown only lists patterns of the chosen level. The current
  // pattern stays selected when it still fits.
  function fillPatternSelect() {
    const patSelect = $('pat-select');
    patSelect.textContent = '';
    const fits = state.patterns.filter((p) => p.level === state.level);
    fits.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.textContent = p.name;
      patSelect.appendChild(opt);
    });
    if (!fits.some((p) => p.name === state.patName)) state.patName = fits.length ? fits[0].name : null;
    patSelect.value = state.patName || '';
    document.querySelectorAll('#level-seg button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.level === state.level)));
  }

  function stepLabel(o) {
    if (o.isDing) return 'D';
    const i = state.degrees.indexOf(o);
    return i >= 0 ? String(i + 1) : o.name;
  }

  function paint() {
    const T = state.tuning;
    const sel = T.selections[state.selIndex];
    const members = selectionMembers(sel);

    // Instrument: colors and numbers follow what you play over.
    T.notes.forEach((o) => {
      const inSel = members.includes(o);
      const isRoot = inSel && pc(o.midi) === sel.root;
      o.g.classList.toggle('root', isRoot);
      o.g.classList.toggle('sel', (inSel || o.isDing) && !isRoot);
      o.g.classList.toggle('dim', !inSel && !o.isDing);
      const i = state.degrees.indexOf(o);
      o.dispNum = o.isDing ? 'ding' : i >= 0 ? String(i + 1) : '';
      o.numLabel.textContent = o.dispNum;
    });
    layout();

    const names = [...new Set(members.map((o) => o.name))];
    $('sel-desc').textContent = '';
    const d = document.createElement('span');
    d.textContent = sel.desc + ' ';
    const n = document.createElement('span');
    n.className = 'note-list';
    n.textContent = names.join(' · ');
    $('sel-desc').append(d, n);
    [...$('sel-chips').children].forEach((b, i) => b.setAttribute('aria-pressed', String(i === state.selIndex)));

    const pat = currentPattern();
    $('pat-desc').textContent = pat ? pat.desc : '';
    const list = $('pat-steps');
    list.textContent = '';
    (pat ? pat.parsed : []).forEach((s, i) => {
      const li = document.createElement('li');
      // Each step is a button: clicking it starts playback from that step.
      const btn = document.createElement('button');
      btn.className = 'step step-' + s.kind;
      const main = document.createElement('span');
      main.className = 'step-main';
      const sub = document.createElement('span');
      sub.className = 'step-sub';
      let label;
      if (s.kind === 'rest') { main.textContent = '·'; sub.textContent = '\u00a0'; label = 'rest'; btn.append(main, sub); }
      else if (s.kind === 'tak') { main.textContent = 'T'; sub.textContent = s.hand; label = 'tak, ' + s.hand; btn.append(main, sub); }
      else {
        main.textContent = s.notes.map(stepLabel).join('+');
        const noteNames = s.notes.map((o) => o.name).join('+');
        sub.textContent = s.hand;
        label = noteNames + ', ' + s.hand;
        const nm = document.createElement('span');
        nm.className = 'step-note';
        nm.textContent = noteNames;
        btn.append(main, nm, sub);
      }
      btn.setAttribute('aria-label', 'Play from step ' + (i + 1) + ': ' + label);
      btn.title = 'Play from here';
      btn.addEventListener('click', () => { stopPlayback(); playPattern(i); });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  // Picking what to play over rebuilds the patterns on its notes.
  function refreshPatterns() {
    stopPlayback();
    buildPatterns();
    fillPatternSelect();
    paint();
  }

  function renderPanels() {
    const T = state.tuning;
    const chips = $('sel-chips');
    chips.textContent = '';
    T.selections.forEach((sel, i) => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.textContent = sel.name;
      b.addEventListener('click', () => { state.selIndex = i; refreshPatterns(); });
      chips.appendChild(b);
    });
  }

  // ---------- playback ----------
  function stopPlayback() {
    if (!state.playing) return;
    state.playing.timers.forEach(clearTimeout);
    clearInterval(state.playing.interval);
    document.querySelectorAll('.step.now').forEach((s) => s.classList.remove('now'));
    state.playing = null;
    updatePlayButtons();
  }

  const ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
  const ICON_STOP = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="6.5" width="11" height="11" rx="1.5"/></svg>';

  function setPlayButton(btn, playing) {
    btn.classList.toggle('playing', playing);
    btn.setAttribute('aria-label', playing ? 'Stop' : 'Play');
    btn.title = playing ? 'Stop' : 'Play';
    btn.innerHTML = playing ? ICON_STOP : ICON_PLAY;
  }

  function updatePlayButtons() {
    const playing = !!state.playing;
    setPlayButton($('btn-play-pat'), playing);
    setPlayButton($('btn-fab'), playing);
  }

  function playPattern(from) {
    if (state.playing) { stopPlayback(); if (from === undefined) return; }
    const pat = currentPattern();
    if (!pat) return;
    const ctx = ac();
    const steps = pat.parsed;
    const chips = [...$('pat-steps').querySelectorAll('.step')];
    const p = { timers: [], next: from || 0, time: ctx.currentTime + 0.08 };
    // Lookahead scheduler: queue audio slightly ahead so tempo stays steady.
    const tick = () => {
      const stepDur = 60 / state.tempo / 2;
      while (p.time < ctx.currentTime + 0.15) {
        if (p.next >= steps.length) {
          if (!state.loop) {
            p.timers.push(at(p.time + 0.3, () => stopPlayback()));
            clearInterval(p.interval);
            return;
          }
          p.next = 0;
        }
        const i = p.next;
        const s = steps[i];
        const t = p.time;
        if (s.kind === 'tak') tak(t, { hand: s.hand });
        if (s.kind === 'notes') s.notes.forEach((o) => strike(o.midi, t, s.notes.length > 1 ? 0.8 : 1));
        p.timers.push(at(t, () => {
          chips.forEach((c, j) => c.classList.toggle('now', j === i));
          if (s.notes) s.notes.forEach(flash);
        }));
        if (p.timers.length > 64) p.timers.splice(0, 32);
        p.next++;
        p.time += stepDur;
      }
    };
    p.interval = setInterval(tick, 25);
    tick();
    state.playing = p;
    updatePlayButtons();
  }

  // ---------- tunings ----------
  function setTuning(id, push) {
    stopPlayback();
    const def = TUNINGS.find((t) => t.id === id) || TUNINGS[0];
    state.tuning = buildTuning(def);
    state.selIndex = 0;
    $('tuning-select').value = def.id;
    save('tuning', def.id);
    if (push && location.hash !== '#' + def.id) history.replaceState(null, '', '#' + def.id);
    renderHeader();
    renderInstrument();
    renderPanels();
    refreshPatterns();
  }

  // ---------- controls ----------
  function renderMute() {
    const btn = $('btn-mute');
    btn.setAttribute('aria-pressed', String(audio.muted));
    btn.setAttribute('aria-label', audio.muted ? 'Unmute sound' : 'Mute sound');
    btn.innerHTML = audio.muted
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  }

  function init() {
    const select = $('tuning-select');
    TUNINGS.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name + ' (' + (1 + t.top.length + (t.bottom ? t.bottom.length : 0)) + ')';
      select.appendChild(opt);
    });
    select.addEventListener('change', () => setTuning(select.value, true));

    // Tuning details live in a pop-up under the title.
    const info = $('tuning-info');
    const infoBtn = $('btn-tuning-info');
    const showInfo = (open) => { info.hidden = !open; infoBtn.setAttribute('aria-expanded', String(open)); };
    infoBtn.addEventListener('click', (e) => { e.stopPropagation(); showInfo(info.hidden); });
    document.addEventListener('click', (e) => { if (!info.hidden && !info.contains(e.target)) showInfo(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !info.hidden) { showInfo(false); infoBtn.focus(); } });
    $('btn-mirror').addEventListener('click', () => { state.mirrored = !state.mirrored; save('mirrored', state.mirrored); layout(); });
    $('btn-play-pat').addEventListener('click', () => playPattern());
    document.querySelectorAll('#level-seg button').forEach((b) => b.addEventListener('click', () => {
      stopPlayback();
      state.level = b.dataset.level;
      save('level', state.level);
      fillPatternSelect();
      paint();
    }));
    $('pat-select').addEventListener('change', (e) => { stopPlayback(); state.patName = e.target.value; paint(); });
    $('btn-fab').addEventListener('click', () => playPattern());

    const tempo = $('input-tempo');
    tempo.value = state.tempo;
    $('out-tempo').textContent = state.tempo;
    tempo.addEventListener('input', () => { state.tempo = Number(tempo.value); $('out-tempo').textContent = tempo.value; save('tempo', state.tempo); });
    const loop = $('input-loop');
    loop.checked = state.loop;
    loop.addEventListener('change', () => { state.loop = loop.checked; save('loop', state.loop); });

    const vol = $('input-volume');
    vol.value = audio.volume;
    vol.addEventListener('input', () => { audio.volume = Number(vol.value); save('volume', audio.volume); applyVolume(); });
    $('btn-mute').addEventListener('click', () => { audio.muted = !audio.muted; save('muted', audio.muted); renderMute(); applyVolume(); });
    renderMute();

    document.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      const T = state.tuning;
      let note = null;
      if (e.key === ' ' && tag !== 'BUTTON' && !e.target.closest('.field')) note = T.notes[0];
      else if (/^[0-9]$/.test(e.key)) note = T.notes.find((o) => o.dispNum === String(e.key === '0' ? 10 : Number(e.key)));
      if (note) { e.preventDefault(); if (e.repeat) return; stopPlayback(); strike(note.midi); flash(note); return; }
      if (e.key === 't' || e.key === 'T') { if (!e.repeat) { stopPlayback(); tak(); } return; }
      if (e.key === 'p' || e.key === 'P') playPattern();
    });

    window.addEventListener('hashchange', () => setTuning(location.hash.slice(1), false));

    const fromHash = location.hash.slice(1);
    const initial = TUNINGS.some((t) => t.id === fromHash) ? fromHash : load('tuning', TUNINGS[0].id);
    setTuning(initial, false);
    updatePlayButtons();
  }

  init();
})();
