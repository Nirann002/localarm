// Audio engine designed to keep working when the phone screen is off / app backgrounded.
//
// Strategy:
// 1. While tracking, a near-silent looping audio element keeps the media session alive.
//    Mobile browsers keep an already-playing audio element running in the background,
//    which lets us swap in a loud alarm later without a fresh user gesture.
// 2. The alarm itself is a looping HTMLAudioElement (survives backgrounding much better
//    than a live Web Audio oscillator), backed up by a Web Audio oscillator as fallback.

function encodeWav(samples: Float32Array, sampleRate: number): string {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return `data:audio/wav;base64,${btoa(binary)}`;
}

let alarmSrc: string | null = null;
function getAlarmSrc(): string {
  if (alarmSrc) return alarmSrc;
  const sampleRate = 22050;
  const duration = 2; // seconds, loops seamlessly
  const total = sampleRate * duration;
  const samples = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    const t = i / sampleRate;
    const beatIndex = Math.floor(t / 0.25);
    const inBeat = beatIndex % 2 === 0; // 250ms on / 250ms off
    const freq = beatIndex % 4 === 0 ? 880 : 660;
    const env = inBeat ? Math.min(1, (t % 0.25) * 40) * Math.min(1, (0.25 - (t % 0.25)) * 40) : 0;
    samples[i] = env * 0.9 * Math.sign(Math.sin(2 * Math.PI * freq * t));
  }
  alarmSrc = encodeWav(samples, sampleRate);
  return alarmSrc;
}

let silentSrc: string | null = null;
function getSilentSrc(): string {
  if (silentSrc) return silentSrc;
  const sampleRate = 8000;
  const samples = new Float32Array(sampleRate * 2);
  // Extremely quiet tone (not pure zero) so mobile audio sessions stay active.
  for (let i = 0; i < samples.length; i++) {
    samples[i] = 0.0004 * Math.sin((2 * Math.PI * 60 * i) / sampleRate);
  }
  silentSrc = encodeWav(samples, sampleRate);
  return silentSrc;
}

let keepAliveEl: HTMLAudioElement | null = null;
let alarmEl: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let osc: OscillatorNode | null = null;

/** Call from a user gesture (e.g. "Start tracking") to unlock audio for later. */
export async function primeAudio(): Promise<void> {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    await ctx.resume();
  } catch {
    /* ignore */
  }

  if (!keepAliveEl) {
    keepAliveEl = new Audio(getSilentSrc());
    keepAliveEl.loop = true;
    keepAliveEl.volume = 0.02;
    keepAliveEl.setAttribute("playsinline", "true");
  }
  try {
    await keepAliveEl.play();
  } catch {
    /* user gesture may be required */
  }

  // Pre-create the alarm element so no network/decoding is needed later.
  if (!alarmEl) {
    alarmEl = new Audio(getAlarmSrc());
    alarmEl.loop = true;
    alarmEl.volume = 1;
    alarmEl.preload = "auto";
    alarmEl.setAttribute("playsinline", "true");
  }
}

export function keepAudioSessionAlive(): void {
  if (keepAliveEl && keepAliveEl.paused) {
    keepAliveEl.play().catch(() => {});
  }
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

export function releaseAudioSession(): void {
  if (keepAliveEl) {
    keepAliveEl.pause();
    keepAliveEl.currentTime = 0;
  }
}

export function playAlarmSound(): void {
  if (!alarmEl) {
    alarmEl = new Audio(getAlarmSrc());
    alarmEl.loop = true;
    alarmEl.volume = 1;
    alarmEl.setAttribute("playsinline", "true");
  }
  alarmEl.currentTime = 0;
  alarmEl.volume = 1;
  const attempt = () => alarmEl?.play().catch(() => startOscillatorFallback());
  attempt();
  // Retry a couple of times in case the tab was throttled while asleep.
  window.setTimeout(() => {
    if (alarmEl && alarmEl.paused) attempt();
  }, 600);
  releaseAudioSession();
}

function startOscillatorFallback(): void {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    ctx.resume().catch(() => {});
    if (osc) return;
    osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 800;
    gain.gain.value = 1;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
  } catch {
    /* ignore */
  }
}

export function stopAlarmSound(): void {
  if (alarmEl) {
    alarmEl.pause();
    alarmEl.currentTime = 0;
  }
  if (osc) {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      /* ignore */
    }
    osc = null;
  }
}
