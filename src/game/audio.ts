type Tone = { f: number; t: number; d: number; type?: OscillatorType; g?: number };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC({ latencyHint: "interactive" });
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function setMuted(v: boolean) {
  muted = v;
  if (master && ctx) master.gain.setTargetAtTime(v ? 0 : 0.22, ctx.currentTime, 0.02);
}

export function isMuted() {
  return muted;
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
