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

    const topCount = n;
    const patterns = (def.patterns || []).concat(PATTERNS)
      .map((p) => Object.assign({}, p, { parsed: parsePattern(p.steps, notes, topCount) }))
      .filter((p) => p.parsed);

    return { def, notes, selections, patterns, dingPc };
  }

  // Returns [{kind:'notes'|'tak'|'rest', notes:[note], label}] or null if the
  // pattern needs more tone fields than this tuning has.
  function parsePattern(src, notes, topCount) {
    const tokens = [];
    src.trim().split(/\s+/).forEach((tok) => {
      if (tok === '1..N') { for (let i = 1; i <= topCount; i++) tokens.push(String(i)); }
      else if (tok === 'N..1') { for (let i = topCount; i >= 1; i--) tokens.push(String(i)); }
      else tokens.push(tok);
    });
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
          if (idx < 1 || idx > topCount) return null;
          note = notes[idx];
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
    ctx: null, master: null, wet: null, noise: null,
    volume: load('volume', 80), muted: load('muted', false),
  };

  function ac() {
    if (!audio.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 4;
      comp.connect(ctx.destination);
      const master = ctx.createGain();
      master.connect(comp);
      const verb = ctx.createConvolver();
      verb.buffer = impulse(ctx, 2.8, 2.6);
      const wet = ctx.createGain();
      wet.gain.value = 0.32;
      wet.connect(verb); verb.connect(master);
      const noise = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      Object.assign(audio, { ctx, master, wet, noise });
      applyVolume();
    }
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    return audio.ctx;
  }

  function impulse(ctx, seconds, decay) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function applyVolume() {
    if (!audio.master) return;
    const v = audio.muted ? 0 : Math.pow(audio.volume / 100, 1.5) * 0.9;
    audio.master.gain.setTargetAtTime(v, audio.ctx.currentTime, 0.02);
  }

  function out(node) { node.connect(audio.master); node.connect(audio.wet); }

  // A handpan note: fundamental, octave and compound fifth (the three partials
  // makers tune), slightly detuned pairs for shimmer, plus a soft strike click.
  function strike(midi, when, velocity) {
    const ctx = ac();
    const t0 = Math.max(when || 0, ctx.currentTime);
    const vel = velocity || 1;
    const f = hz(midi);
    const ring = Math.min(5.5, Math.max(2.2, 2.2 + (76 - midi) * 0.11));
    const body = ctx.createGain();
    body.gain.value = 0.32 * vel;
    out(body);
    [[1, 1, ring], [2, 0.38, ring * 0.6], [3, 0.14, ring * 0.38], [4.02, 0.04, ring * 0.2]].forEach(([mult, amp, dur]) => {
      [-1, 1].forEach((side) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f * mult * (1 + side * 0.0009);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(amp * 0.5, t0 + 0.006 + 0.004 * mult);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g); g.connect(body);
        o.start(t0); o.stop(t0 + dur + 0.05);
      });
    });
    const click = ctx.createBufferSource();
    click.buffer = audio.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = Math.min(9000, f * 6); bp.Q.value = 2;
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(0.12 * vel, t0);
    cg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.03);
    click.connect(bp); bp.connect(cg); out(cg);
    click.start(t0); click.stop(t0 + 0.05);
  }

  // A tak: a short, bright tap on the shell with a hint of body resonance.
  function tak(when) {
    const ctx = ac();
    const t0 = Math.max(when || 0, ctx.currentTime);
    const src = ctx.createBufferSource();
    src.buffer = audio.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.07);
    src.connect(bp); bp.connect(g); out(g);
    src.start(t0); src.stop(t0 + 0.1);
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.frequency.setValueAtTime(320, t0);
    o.frequency.exponentialRampToValueAtTime(140, t0 + 0.08);
    og.gain.setValueAtTime(0.12, t0);
    og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
    o.connect(og); out(og);
    o.start(t0); o.stop(t0 + 0.15);
  }

  // Run fn when the audio clock reaches `when`, so visuals line up with sound.
  function at(when, fn) {
    const ms = Math.max(0, (when - audio.ctx.currentTime) * 1000);
    return setTimeout(fn, ms);
  }

  // ---------- state ----------
  const state = {
    tuning: null,
    tab: load('tab', 'explore'),
    selIndex: 0,
    patIndex: 0,
    mirrored: load('mirrored', false),
    tempo: load('tempo', 88),
    loop: load('loop', true),
    playing: null, // { kind: 'sel'|'pat', timers: [], stop() }
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
    shell.addEventListener('pointerdown', (e) => { e.preventDefault(); stopPlayback(); tak(); ripple(svg, e); });
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
      o.numLabel.textContent = o.isDing ? 'ding' : o.num;
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
      o.label.setAttribute('y', o.y + o.fs * 0.35 - (o.num ? 4 : 0));
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

  // ----- selections (scales and chords) -----
  function selectionMembers(sel) {
    const T = state.tuning;
    if (sel.seq) return sel.seq.map((name) => T.notes.find((o) => o.name === name)).filter(Boolean);
    return T.notes.filter((o) => sel.pcs.includes(pc(o.midi))).sort((a, b) => a.midi - b.midi);
  }

  function paintSelection() {
    const T = state.tuning;
    const sel = T.selections[state.selIndex];
    const members = selectionMembers(sel);
    T.notes.forEach((o) => {
      const inSel = members.includes(o);
      const isRoot = inSel && pc(o.midi) === sel.root;
      o.g.classList.toggle('root', isRoot);
      o.g.classList.toggle('sel', inSel && !isRoot);
      o.g.classList.toggle('dim', !inSel);
    });
    const names = [];
    members.forEach((o) => { if (!names.includes(o.name)) names.push(o.name); });
    $('sel-desc').textContent = '';
    const p = document.createElement('span');
    p.textContent = sel.desc + ' ';
    const n = document.createElement('span');
    n.className = 'note-list';
    n.textContent = names.join(' · ');
    $('sel-desc').append(p, n);
    [...$('sel-chips').children].forEach((b, i) => b.setAttribute('aria-pressed', String(i === state.selIndex)));
  }

  function paintPattern() {
    const T = state.tuning;
    const pat = T.patterns[state.patIndex];
    const used = new Set();
    pat.parsed.forEach((s) => (s.notes || []).forEach((o) => used.add(o)));
    T.notes.forEach((o) => {
      o.g.classList.toggle('root', used.has(o) && !!o.isDing);
      o.g.classList.toggle('sel', used.has(o) && !o.isDing);
      o.g.classList.toggle('dim', !used.has(o));
    });
    $('pat-name').textContent = pat.name;
    $('pat-level').textContent = pat.level;
    $('pat-level').dataset.level = pat.level.toLowerCase();
    $('pat-desc').textContent = pat.desc;
    const list = $('pat-steps');
    list.textContent = '';
    pat.parsed.forEach((s, i) => {
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
        main.textContent = s.notes.map((o) => o.num || o.name).join('+');
        const names = s.notes.map((o) => o.name).join('+');
        sub.textContent = s.hand;
        label = names + ', ' + s.hand;
        const nm = document.createElement('span');
        nm.className = 'step-note';
        nm.textContent = names;
        btn.append(main, nm, sub);
      }
      btn.setAttribute('aria-label', 'Play from step ' + (i + 1) + ': ' + label);
      btn.title = 'Play from here';
      btn.addEventListener('click', () => { stopPlayback(); playPattern(i); });
      li.appendChild(btn);
      list.appendChild(li);
    });
    [...$('pat-list').children].forEach((b, i) => b.setAttribute('aria-pressed', String(i === state.patIndex)));
  }

  function paint() {
    if (state.tab === 'explore') paintSelection(); else paintPattern();
  }

  function renderPanels() {
    const T = state.tuning;
    const chips = $('sel-chips');
    chips.textContent = '';
    T.selections.forEach((sel, i) => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.textContent = sel.name;
      b.addEventListener('click', () => { stopPlayback(); state.selIndex = i; paintSelection(); });
      chips.appendChild(b);
    });
    const list = $('pat-list');
    list.textContent = '';
    T.patterns.forEach((pat, i) => {
      const b = document.createElement('button');
      b.className = 'pattern-item';
      const name = document.createElement('span');
      name.textContent = pat.name;
      const lvl = document.createElement('small');
      lvl.textContent = pat.level;
      b.append(name, lvl);
      b.addEventListener('click', () => { stopPlayback(); state.patIndex = i; paintPattern(); });
      list.appendChild(b);
    });
  }

  function setTab(tab) {
    stopPlayback();
    state.tab = tab;
    save('tab', tab);
    ['explore', 'patterns'].forEach((t) => {
      $('tab-' + t).hidden = t !== tab;
      $('tab-btn-' + t).setAttribute('aria-selected', String(t === tab));
    });
    paint();
    updatePlayButtons();
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
    const p = state.playing;
    setPlayButton($('btn-play-sel'), !!(p && p.kind === 'sel'));
    setPlayButton($('btn-play-pat'), !!(p && p.kind === 'pat'));
    // The floating button controls whichever tab is open.
    setPlayButton($('btn-fab'), !!(p && p.kind === (state.tab === 'patterns' ? 'pat' : 'sel')));
  }

  function playCurrent() {
    if (state.tab === 'patterns') playPattern(); else playSelection();
  }

  function playSelection() {
    if (state.playing) { const was = state.playing.kind; stopPlayback(); if (was === 'sel') return; }
    const ctx = ac();
    const members = selectionMembers(state.tuning.selections[state.selIndex]);
    const gap = 0.36;
    const start = ctx.currentTime + 0.05;
    const timers = [];
    members.forEach((o, i) => {
      const t = start + i * gap;
      strike(o.midi, t, 0.9);
      timers.push(at(t, () => flash(o)));
    });
    timers.push(at(start + members.length * gap + 0.4, () => { state.playing = null; updatePlayButtons(); }));
    state.playing = { kind: 'sel', timers };
    updatePlayButtons();
  }

  function playPattern(from) {
    if (state.playing) { const was = state.playing.kind; stopPlayback(); if (was === 'pat') return; }
    const ctx = ac();
    const steps = state.tuning.patterns[state.patIndex].parsed;
    const chips = [...$('pat-steps').querySelectorAll('.step')];
    const p = { kind: 'pat', timers: [], next: from || 0, time: ctx.currentTime + 0.08 };
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
        if (s.kind === 'tak') tak(t);
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
    state.patIndex = 0;
    $('tuning-select').value = def.id;
    save('tuning', def.id);
    if (push && location.hash !== '#' + def.id) history.replaceState(null, '', '#' + def.id);
    renderHeader();
    renderInstrument();
    renderPanels();
    paint();
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

    $('btn-mirror').addEventListener('click', () => { state.mirrored = !state.mirrored; save('mirrored', state.mirrored); layout(); });
    $('tab-btn-explore').addEventListener('click', () => setTab('explore'));
    $('tab-btn-patterns').addEventListener('click', () => setTab('patterns'));
    $('btn-play-sel').addEventListener('click', playSelection);
    $('btn-play-pat').addEventListener('click', () => playPattern());
    $('btn-fab').addEventListener('click', playCurrent);

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
      else if (/^[0-9]$/.test(e.key)) note = T.notes.find((o) => o.num === String(e.key === '0' ? 10 : Number(e.key)));
      if (note) { e.preventDefault(); if (e.repeat) return; stopPlayback(); strike(note.midi); flash(note); return; }
      if (e.key === 't' || e.key === 'T') { if (!e.repeat) { stopPlayback(); tak(); } return; }
      if (e.key === 'p' || e.key === 'P') { if (state.tab !== 'patterns') setTab('patterns'); playPattern(); }
    });

    window.addEventListener('hashchange', () => setTuning(location.hash.slice(1), false));

    const fromHash = location.hash.slice(1);
    const initial = TUNINGS.some((t) => t.id === fromHash) ? fromHash : load('tuning', TUNINGS[0].id);
    setTuning(initial, false);
    setTab(state.tab === 'patterns' ? 'patterns' : 'explore');
  }

  init();
})();
