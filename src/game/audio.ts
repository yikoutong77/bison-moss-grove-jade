type Tone = { f: number; t: number; d: number; type?: OscillatorType; g?: number };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

export type BgmId = "menu" | "tavern" | "combat";

const TRACKS: Record<BgmId, string> = {
  menu: "/audio/menu.mp3",
  tavern: "/audio/tavern.mp3",
  combat: "/audio/combat.mp3",
};

const BGM_VOL = 0.34;

type Slot = {
  el: HTMLAudioElement;
  timer: number;
  start: () => void;
};

let bgmId: BgmId | null = null;
let current: Slot | null = null;
const fading: Slot[] = [];

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC({ latencyHint: "interactive" });
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  if (current && !muted && current.el.paused) void current.el.play().catch(() => {});
}

export function setMuted(v: boolean) {
  muted = v;
  try {
    localStorage.setItem("tavern-muted", v ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (master && ctx) master.gain.setTargetAtTime(v ? 0 : 0.22, ctx.currentTime, 0.02);
  if (!current) return;
  if (v) {
    current.el.pause();
  } else {
    current.el.volume = BGM_VOL;
    void current.el.play().catch(() => {});
  }
}

export function isMuted() {
  return muted;
}

export function restoreMute(): boolean {
  try {
    if (localStorage.getItem("tavern-muted") === "1") {
      muted = true;
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

function clearTimer(s: Slot) {
  if (s.timer) {
    window.clearInterval(s.timer);
    s.timer = 0;
  }
}

function dispose(s: Slot) {
  clearTimer(s);
  s.el.removeEventListener("canplaythrough", s.start);
  s.el.pause();
  s.el.removeAttribute("src");
  try {
    s.el.load();
  } catch {
    /* ignore */
  }
}

function stopAll() {
  if (current) {
    dispose(current);
    current = null;
  }
  while (fading.length) {
    const s = fading.pop();
    if (s) dispose(s);
  }
}

function fadeOutThenDrop(s: Slot, ms: number) {
  fading.push(s);
  const startVol = s.el.volume;
  const t0 = performance.now();
  clearTimer(s);
  s.timer = window.setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    s.el.volume = startVol * (1 - k);
    if (k >= 1) {
      const i = fading.indexOf(s);
      if (i >= 0) fading.splice(i, 1);
      dispose(s);
    }
  }, 32);
}

function fadeIn(s: Slot, ms: number) {
  clearTimer(s);
  const target = muted ? 0 : BGM_VOL;
  const startVol = s.el.volume;
  const t0 = performance.now();
  s.timer = window.setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    s.el.volume = startVol + (target - startVol) * k;
    if (k >= 1) clearTimer(s);
  }, 32);
}

export function playBgm(id: BgmId) {
  if (bgmId === id && current) {
    if (!muted && current.el.paused) void current.el.play().catch(() => {});
    return;
  }
  const prev = current;
  current = null;
  if (prev) fadeOutThenDrop(prev, 280);
  while (fading.length > 1) {
    const extra = fading.shift();
    if (extra && extra !== prev) dispose(extra);
  }

  bgmId = id;
  const el = new Audio(TRACKS[id]);
  el.loop = true;
  el.preload = "auto";
  el.volume = 0;
  const slot: Slot = { el, timer: 0, start: () => undefined };
  slot.start = () => {
    if (current !== slot) return;
    el.removeEventListener("canplaythrough", slot.start);
    if (!muted) void el.play().catch(() => {});
    fadeIn(slot, 360);
  };
  current = slot;
  if (el.readyState >= 3) slot.start();
  else el.addEventListener("canplaythrough", slot.start);
}

export function stopBgm() {
  bgmId = null;
  stopAll();
}

function beep(tones: Tone[]) {
  if (!ctx || !master || muted) return;
  const now = ctx.currentTime;
  for (const tn of tones) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = tn.type ?? "square";
    osc.frequency.setValueAtTime(tn.f, now + tn.t);
    g.gain.setValueAtTime(0.0001, now + tn.t);
    g.gain.exponentialRampToValueAtTime(tn.g ?? 0.4, now + tn.t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + tn.t + tn.d);
    osc.connect(g);
    g.connect(master);
    osc.start(now + tn.t);
    osc.stop(now + tn.t + tn.d + 0.02);
  }
}

function noise(dur: number, gain = 0.2) {
  if (!ctx || !master || muted) return;
  const n = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = n.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ctx.createBufferSource();
  src.buffer = n;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(master);
  src.start();
}

export const sfx = {
  click: () => beep([{ f: 620, t: 0, d: 0.04, type: "triangle", g: 0.18 }]),
  coin: () =>
    beep([
      { f: 880, t: 0, d: 0.07, type: "triangle", g: 0.28 },
      { f: 1320, t: 0.05, d: 0.08, type: "triangle", g: 0.22 },
    ]),
  buy: () =>
    beep([
      { f: 392, t: 0, d: 0.08, type: "square", g: 0.2 },
      { f: 523, t: 0.07, d: 0.1, type: "square", g: 0.2 },
    ]),
  sell: () => beep([{ f: 240, t: 0, d: 0.1, type: "sawtooth", g: 0.12 }]),
  refresh: () =>
    beep([
      { f: 480, t: 0, d: 0.05, type: "triangle" },
      { f: 560, t: 0.05, d: 0.05, type: "triangle" },
      { f: 640, t: 0.1, d: 0.08, type: "triangle" },
    ]),
  upgrade: () =>
    beep([
      { f: 330, t: 0, d: 0.1, type: "square", g: 0.22 },
      { f: 415, t: 0.1, d: 0.1, type: "square", g: 0.22 },
      { f: 523, t: 0.2, d: 0.16, type: "square", g: 0.24 },
    ]),
  freeze: () => beep([{ f: 1100, t: 0, d: 0.12, type: "sine", g: 0.16 }]),
  hit: () => {
    noise(0.08, 0.18);
    beep([{ f: 140, t: 0, d: 0.09, type: "sawtooth", g: 0.3 }]);
  },
  death: () => beep([{ f: 90, t: 0, d: 0.22, type: "sawtooth", g: 0.28 }]),
  win: () =>
    beep([
      { f: 523, t: 0, d: 0.12, type: "triangle", g: 0.24 },
      { f: 659, t: 0.12, d: 0.12, type: "triangle", g: 0.24 },
      { f: 784, t: 0.24, d: 0.22, type: "triangle", g: 0.28 },
    ]),
  lose: () =>
    beep([
      { f: 330, t: 0, d: 0.14, type: "triangle", g: 0.2 },
      { f: 247, t: 0.14, d: 0.2, type: "triangle", g: 0.2 },
    ]),
  triple: () =>
    beep([
      { f: 698, t: 0, d: 0.1, type: "square", g: 0.22 },
      { f: 880, t: 0.1, d: 0.1, type: "square", g: 0.22 },
      { f: 1046, t: 0.2, d: 0.18, type: "square", g: 0.26 },
    ]),
};
