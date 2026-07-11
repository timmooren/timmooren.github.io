"use strict";

/* ---------- Storage ---------- */

const STORE_KEY = "tabata:presets";
const SOUND_KEY = "tabata:sound";
const VOLUME_KEY = "tabata:volume";

const DEFAULTS = { work: 20, rest: 10, rounds: 6 };
const PREP_SECONDS = 5;

function loadPresets() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY));
    if (Array.isArray(raw)) return raw;
  } catch (_) { /* corrupted storage: fall through to seed */ }
  const seed = [
    { id: crypto.randomUUID(), name: "Classic Tabata", ...DEFAULTS },
    { id: crypto.randomUUID(), name: "30/20", work: 30, rest: 20, rounds: 6 },
  ];
  localStorage.setItem(STORE_KEY, JSON.stringify(seed));
  return seed;
}

function savePresets(presets) {
  localStorage.setItem(STORE_KEY, JSON.stringify(presets));
}

let presets = loadPresets();

/* ---------- Sound ---------- */

let soundOn = localStorage.getItem(SOUND_KEY) !== "0";
let masterVolume = clampVolume(localStorage.getItem(VOLUME_KEY)) / 100; // 0–1 multiplier
let audioCtx = null;

function clampVolume(raw) {
  if (raw == null || raw === "") return 100; // default: full volume
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 100;
}

function ensureAudio() {
  if (!soundOn) return;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

// Soft sine tone with a short attack and a long decay, so cues read as
// "chime" rather than "alarm"
function beep(freq, duration = 0.35, delay = 0, volume = 0.22) {
  if (!soundOn || !audioCtx || masterVolume <= 0) return;
  const t = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume * masterVolume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

// Pitched well below the usual cues (about two semitones up from a full
// octave down), for a deep but not muddy chime
const sounds = {
  tick: () => beep(330, 0.2, 0, 0.15),                       // E4, quiet
  workStart: () => { beep(294, 0.3); beep(440, 0.45, 0.12); }, // D4 → A4, rising
  restStart: () => { beep(370, 0.3); beep(247, 0.5, 0.12); },  // F#4 → B3, falling
  finish: () => { beep(294, 0.3); beep(370, 0.3, 0.18); beep(440, 0.7, 0.36); },
};

/* ---------- Views ---------- */

const views = {
  home: document.getElementById("view-home"),
  editor: document.getElementById("view-editor"),
  timer: document.getElementById("view-timer"),
};

function showView(name) {
  Object.values(views).forEach(v => v.classList.remove("active"));
  views[name].classList.add("active");
}

function fmt(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ---------- Home ---------- */

const presetList = document.getElementById("preset-list");
const btnSound = document.getElementById("btn-sound");
const inputVolume = document.getElementById("input-volume");

function renderSoundBtn() {
  btnSound.textContent = soundOn ? "\u{1F50A}" : "\u{1F507}";
}

btnSound.addEventListener("click", () => {
  soundOn = !soundOn;
  localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
  renderSoundBtn();
});

inputVolume.addEventListener("input", () => {
  const value = clampVolume(inputVolume.value);
  masterVolume = value / 100;
  localStorage.setItem(VOLUME_KEY, String(value));
});

function renderHome() {
  presetList.replaceChildren();
  if (presets.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-note";
    li.textContent = "No presets yet. Create one below.";
    presetList.appendChild(li);
    return;
  }
  for (const p of presets) {
    const li = document.createElement("li");
    li.className = "preset-card";

    const main = document.createElement("button");
    main.className = "preset-main";
    main.setAttribute("aria-label", `Start ${p.name}`);

    const name = document.createElement("span");
    name.className = "preset-name";
    name.textContent = p.name;

    const meta = document.createElement("span");
    meta.className = "preset-meta";
    const on = document.createElement("b");
    on.className = "stat stat-work";
    on.textContent = fmt(p.work);
    const off = document.createElement("b");
    off.className = "stat stat-rest";
    off.textContent = fmt(p.rest);
    const rounds = document.createElement("b");
    rounds.className = "stat";
    rounds.textContent = String(p.rounds);
    meta.append(
      on, document.createTextNode(" on · "),
      off, document.createTextNode(" off · "),
      rounds, document.createTextNode(" rounds"),
    );

    const strip = document.createElement("span");
    strip.className = "preset-strip";
    const shown = Math.min(p.rounds, 12);
    for (let i = 0; i < shown; i++) {
      const w = document.createElement("i");
      w.className = "w";
      w.style.flex = p.work;
      strip.appendChild(w);
      if (i < shown - 1) {
        const r = document.createElement("i");
        r.className = "r";
        r.style.flex = p.rest;
        strip.appendChild(r);
      }
    }

    main.append(name, meta, strip);
    main.addEventListener("click", () => startWorkout(p));

    const edit = document.createElement("button");
    edit.className = "preset-edit";
    edit.textContent = "Edit";
    edit.setAttribute("aria-label", `Edit ${p.name}`);
    edit.addEventListener("click", () => openEditor(p.id));

    li.append(main, edit);
    presetList.appendChild(li);
  }
}

document.getElementById("btn-new").addEventListener("click", () => openEditor(null));

/* ---------- Editor ---------- */

const inputName = document.getElementById("input-name");
const outputs = {
  work: document.getElementById("out-work"),
  rest: document.getElementById("out-rest"),
  rounds: document.getElementById("out-rounds"),
};
const btnDelete = document.getElementById("btn-delete");
const editorTitle = document.getElementById("editor-title");

const LIMITS = {
  work: { min: 5, max: 600 },
  rest: { min: 5, max: 600 },
  rounds: { min: 1, max: 99 },
};

let editing = null; // preset id being edited, or null for new
let draft = { ...DEFAULTS };

function renderEditor() {
  outputs.work.textContent = fmt(draft.work);
  outputs.rest.textContent = fmt(draft.rest);
  outputs.rounds.textContent = String(draft.rounds);
}

function openEditor(id) {
  editing = id;
  const preset = presets.find(p => p.id === id);
  draft = preset ? { work: preset.work, rest: preset.rest, rounds: preset.rounds } : { ...DEFAULTS };
  inputName.value = preset ? preset.name : "";
  editorTitle.textContent = preset ? "Edit preset" : "New preset";
  btnDelete.hidden = !preset;
  renderEditor();
  showView("editor");
}

document.querySelectorAll(".stepper").forEach(stepper => {
  const field = stepper.dataset.field;
  stepper.querySelectorAll(".step-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const { min, max } = LIMITS[field];
      draft[field] = Math.min(max, Math.max(min, draft[field] + Number(btn.dataset.step)));
      renderEditor();
    });
  });
});

document.getElementById("btn-save").addEventListener("click", () => {
  const name = inputName.value.trim() || "Untitled";
  if (editing) {
    const preset = presets.find(p => p.id === editing);
    Object.assign(preset, { name, ...draft });
  } else {
    presets.push({ id: crypto.randomUUID(), name, ...draft });
  }
  savePresets(presets);
  renderHome();
  showView("home");
});

btnDelete.addEventListener("click", () => {
  const preset = presets.find(p => p.id === editing);
  if (!confirm(`Delete "${preset.name}"?`)) return;
  presets = presets.filter(p => p.id !== editing);
  savePresets(presets);
  renderHome();
  showView("home");
});

document.getElementById("btn-editor-back").addEventListener("click", () => showView("home"));

/* ---------- Timer ---------- */

const fill = document.getElementById("fill");
const timerView = views.timer;
const elClock = document.getElementById("timer-clock");
const elPhase = document.getElementById("timer-phase");
const elRound = document.getElementById("timer-round");
const btnPlay = document.getElementById("btn-play");

const PHASE_LABELS = { prep: "Get ready", work: "Work", rest: "Rest", done: "Done" };

const timer = {
  segments: [],   // [{type, duration, round}]
  index: 0,
  elapsed: 0,     // seconds elapsed within current segment (accumulated across pauses)
  startedAt: 0,   // performance.now() when last resumed
  running: false,
  finished: false,
  lastWhole: null, // last whole remaining second we beeped for
  rafId: 0,
  totalRounds: 0,
};

function buildSegments(preset) {
  const segs = [{ type: "prep", duration: PREP_SECONDS, round: 1 }];
  for (let r = 1; r <= preset.rounds; r++) {
    segs.push({ type: "work", duration: preset.work, round: r });
    if (r < preset.rounds) segs.push({ type: "rest", duration: preset.rest, round: r });
  }
  return segs;
}

function startWorkout(preset) {
  ensureAudio();
  timer.segments = buildSegments(preset);
  timer.totalRounds = preset.rounds;
  timer.finished = false;
  enterSegment(0);
  setRunning(true);
  showView("timer");
  requestWakeLock();
}

function enterSegment(index, { silent = false } = {}) {
  timer.index = index;
  timer.elapsed = 0;
  timer.startedAt = performance.now();
  timer.lastWhole = null;
  const seg = timer.segments[index];
  if (!silent) {
    if (seg.type === "work") sounds.workStart();
    else if (seg.type === "rest") sounds.restStart();
  }
  renderTimer();
}

function currentElapsed() {
  return timer.elapsed + (timer.running ? (performance.now() - timer.startedAt) / 1000 : 0);
}

function setRunning(running) {
  if (timer.finished) return;
  if (running) {
    ensureAudio();
    timer.startedAt = performance.now();
    timer.running = true;
    btnPlay.textContent = "\u275A\u275A";
    btnPlay.setAttribute("aria-label", "Pause");
    cancelAnimationFrame(timer.rafId);
    timer.rafId = requestAnimationFrame(tick);
  } else {
    timer.elapsed = currentElapsed();
    timer.running = false;
    btnPlay.textContent = "\u25B6\uFE0E";
    btnPlay.setAttribute("aria-label", "Resume");
    cancelAnimationFrame(timer.rafId);
  }
}

function tick() {
  if (!timer.running) return;
  const seg = timer.segments[timer.index];
  const remaining = seg.duration - currentElapsed();

  if (remaining <= 0) {
    if (timer.index + 1 < timer.segments.length) {
      enterSegment(timer.index + 1);
    } else {
      finishWorkout();
      return;
    }
  } else {
    // 3-2-1 countdown ticks at the end of every segment
    const whole = Math.ceil(remaining);
    if (whole <= 3 && whole !== timer.lastWhole) {
      timer.lastWhole = whole;
      sounds.tick();
    }
    renderTimer();
  }
  timer.rafId = requestAnimationFrame(tick);
}

function finishWorkout() {
  timer.running = false;
  timer.finished = true;
  cancelAnimationFrame(timer.rafId);
  sounds.finish();
  timerView.className = "view active phase-done";
  elPhase.textContent = PHASE_LABELS.done;
  elClock.hidden = true;
  elRound.textContent = `${timer.totalRounds} / ${timer.totalRounds}`;
  btnPlay.textContent = "\u21BB";
  btnPlay.setAttribute("aria-label", "Restart workout");
  releaseWakeLock();
}

function renderTimer() {
  const seg = timer.segments[timer.index];
  const remaining = Math.max(0, seg.duration - currentElapsed());
  elClock.hidden = false;
  elClock.textContent = String(Math.ceil(remaining));
  elPhase.textContent = PHASE_LABELS[seg.type];
  elRound.textContent = `${seg.round} / ${timer.totalRounds}`;
  timerView.className = `view active phase-${seg.type}`;
  fill.style.transform = `scaleY(${remaining / seg.duration})`;
}

btnPlay.addEventListener("click", () => {
  if (timer.finished) {
    // restart the same workout
    timer.finished = false;
    enterSegment(0, { silent: true });
    setRunning(true);
    requestWakeLock();
    return;
  }
  setRunning(!timer.running);
});

document.getElementById("btn-next").addEventListener("click", () => {
  if (timer.finished) return;
  if (timer.index + 1 < timer.segments.length) enterSegment(timer.index + 1);
  else finishWorkout();
});

document.getElementById("btn-prev").addEventListener("click", () => {
  if (timer.finished) return;
  // like a music player: restart current segment, or jump back if just started
  if (currentElapsed() > 1 || timer.index === 0) enterSegment(timer.index, { silent: true });
  else enterSegment(timer.index - 1, { silent: true });
});

document.getElementById("btn-timer-close").addEventListener("click", () => {
  timer.running = false;
  timer.finished = false;
  cancelAnimationFrame(timer.rafId);
  releaseWakeLock();
  showView("home");
});

/* ---------- Wake lock: keep the screen on mid-workout ---------- */

let wakeLock = null;

async function requestWakeLock() {
  try {
    if ("wakeLock" in navigator) wakeLock = await navigator.wakeLock.request("screen");
  } catch (_) { /* unsupported or denied: timer still works */ }
}

function releaseWakeLock() {
  if (wakeLock) { wakeLock.release(); wakeLock = null; }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && timer.running) requestWakeLock();
});

/* ---------- Init ---------- */

renderSoundBtn();
inputVolume.value = String(Math.round(masterVolume * 100));
renderHome();
