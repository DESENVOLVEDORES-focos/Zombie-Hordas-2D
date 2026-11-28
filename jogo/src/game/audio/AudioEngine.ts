/**
 * Motor de áudio 100% sintetizado (WebAudio): efeitos sonoros + música procedural.
 * Barramentos independentes: master → (música | efeitos).
 */
interface ToneOpts {
  type?: OscillatorType;
  f0: number;
  f1?: number;
  dur: number;
  gain: number;
  delay?: number;
  attack?: number;
  lp?: number;
  bus?: "sfx" | "music";
}
interface NoiseOpts {
  dur: number;
  type?: BiquadFilterType;
  f0: number;
  f1?: number;
  q?: number;
  gain: number;
  delay?: number;
  attack?: number;
  bus?: "sfx" | "music";
}

const MIN_GAP: Record<string, number> = {
  shot_smg: 0.045,
  turret: 0.05,
  step: 0.18,
  zombie_hurt: 0.06,
  zombie_groan: 0.25,
  zombie_attack: 0.1,
  hit_wood: 0.07,
  player_hurt: 0.12,
  explosion: 0.05,
};

const STEP_DUR = 60 / 82 / 2;

export class AudioEngine {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private noiseBuf: AudioBuffer | null = null;
  vol = { master: 0.8, music: 0.5, sfx: 0.8 };
  private last: Record<string, number> = {};
  private voices = 0;
  private v = 1;
  private p = 1;
  private musicTimer: number | null = null;
  private nextTime = 0;
  private step = 0;
  private root = 55;
  private intensity = 0;
  private musicOn = false;

  /** Deve ser chamado a partir de um gesto do usuário (clique/tecla). */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.musicBus = this.ctx.createGain();
      this.sfxBus = this.ctx.createGain();
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 6;
      this.musicBus.connect(this.master);
      this.sfxBus.connect(this.master);
      this.master.connect(comp);
      comp.connect(this.ctx.destination);
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.applyVolumes();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setVolumes(v: { master: number; music: number; sfx: number }) {
    this.vol = { ...v };
    this.applyVolumes();
  }
  private applyVolumes() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.vol.master, t, 0.02);
    this.musicBus.gain.setTargetAtTime(this.vol.music * 0.55, t, 0.02);
    this.sfxBus.gain.setTargetAtTime(this.vol.sfx, t, 0.02);
  }

  // ---------- primitivas ----------
  private env(g: GainNode, t: number, peak: number, attack: number, dur: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(Math.max(0.0002, peak), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, attack + 0.01));
  }

  private noise(o: NoiseOpts) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + (o.delay ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = o.type ?? "lowpass";
    f.frequency.setValueAtTime(o.f0 * this.p, t);
    if (o.f1) f.frequency.exponentialRampToValueAtTime(Math.max(30, o.f1 * this.p), t + o.dur);
    f.Q.value = o.q ?? 0.8;
    const g = ctx.createGain();
    this.env(g, t, o.gain * this.v, o.attack ?? 0.003, o.dur);
    src.connect(f);
    f.connect(g);
    g.connect(o.bus === "music" ? this.musicBus : this.sfxBus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + o.dur + 0.05);
    this.voices++;
    src.onended = () => {
      this.voices--;
    };
  }

  private tone(o: ToneOpts) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + (o.delay ?? 0);
    const osc = ctx.createOscillator();
    osc.type = o.type ?? "sine";
    osc.frequency.setValueAtTime(o.f0 * this.p, t);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(Math.max(18, o.f1 * this.p), t + o.dur);
    const g = ctx.createGain();
    this.env(g, t, o.gain * this.v, o.attack ?? 0.004, o.dur);
    let node: AudioNode = osc;
    if (o.lp) {
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = o.lp;
      osc.connect(f);
      node = f;
    }
    node.connect(g);
    g.connect(o.bus === "music" ? this.musicBus : this.sfxBus);
    osc.start(t);
    osc.stop(t + o.dur + 0.05);
    this.voices++;
    osc.onended = () => {
      this.voices--;
    };
  }

  // ---------- efeitos ----------
  play(name: string, vol = 1, pitch = 1) {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running" || vol < 0.03) return;
    const now = ctx.currentTime;
    if (now - (this.last[name] ?? -1) < (MIN_GAP[name] ?? 0.025)) return;
    this.last[name] = now;
    if (this.voices > 40) return;
    this.v = vol;
    this.p = pitch;
    this.recipe(name);
    this.v = 1;
    this.p = 1;
  }

  private recipe(name: string) {
    const n = (o: NoiseOpts) => this.noise(o);
    const t = (o: ToneOpts) => this.tone(o);
    switch (name) {
      case "shot_pistol":
        n({ dur: 0.13, type: "bandpass", f0: 1900, f1: 600, q: 0.7, gain: 0.6 });
        t({ type: "sawtooth", f0: 240, f1: 60, dur: 0.1, gain: 0.25, lp: 1200 });
        break;
      case "shot_shotgun":
        n({ dur: 0.4, type: "lowpass", f0: 3200, f1: 280, gain: 1 });
        t({ f0: 130, f1: 38, dur: 0.28, gain: 0.55 });
        break;
      case "shot_smg":
        n({ dur: 0.08, type: "bandpass", f0: 2600, f1: 900, q: 0.8, gain: 0.45 });
        t({ type: "sawtooth", f0: 320, f1: 90, dur: 0.06, gain: 0.18, lp: 1500 });
        break;
      case "shot_rifle":
        n({ dur: 0.17, type: "bandpass", f0: 1600, f1: 420, q: 0.6, gain: 0.65 });
        t({ f0: 170, f1: 50, dur: 0.14, gain: 0.4 });
        break;
      case "shot_sniper":
        n({ dur: 0.5, type: "lowpass", f0: 4200, f1: 180, gain: 0.85 });
        t({ f0: 95, f1: 28, dur: 0.42, gain: 0.6 });
        t({ type: "triangle", f0: 1200, f1: 300, dur: 0.12, gain: 0.12 });
        break;
      case "shot_launcher":
        t({ type: "sawtooth", f0: 150, f1: 48, dur: 0.32, gain: 0.4, lp: 900 });
        n({ dur: 0.32, type: "lowpass", f0: 1600, f1: 200, gain: 0.5 });
        break;
      case "turret":
        n({ dur: 0.07, type: "bandpass", f0: 3200, f1: 1500, q: 1, gain: 0.28 });
        t({ type: "square", f0: 520, f1: 200, dur: 0.05, gain: 0.08, lp: 2000 });
        break;
      case "reload":
        n({ dur: 0.04, type: "highpass", f0: 3000, gain: 0.35 });
        n({ dur: 0.07, type: "bandpass", f0: 1200, q: 2, gain: 0.3, delay: 0.22 });
        n({ dur: 0.04, type: "highpass", f0: 2600, gain: 0.4, delay: 0.5 });
        t({ f0: 220, f1: 140, dur: 0.05, gain: 0.15, delay: 0.5 });
        break;
      case "empty":
        n({ dur: 0.04, type: "highpass", f0: 2500, gain: 0.3 });
        break;
      case "step":
        n({ dur: 0.07, type: "lowpass", f0: 500, gain: 0.22 });
        t({ f0: 95, f1: 60, dur: 0.07, gain: 0.12 });
        break;
      case "zombie_groan": {
        const f = 80 + Math.random() * 40;
        t({ type: "sawtooth", f0: f, f1: f * 0.62, dur: 0.85, gain: 0.2, attack: 0.15, lp: 520 });
        t({ type: "square", f0: f * 1.5, f1: f * 0.9, dur: 0.7, gain: 0.05, attack: 0.2, lp: 400 });
        break;
      }
      case "zombie_attack":
        n({ dur: 0.16, type: "bandpass", f0: 800, f1: 300, q: 1, gain: 0.5 });
        t({ type: "sawtooth", f0: 160, f1: 80, dur: 0.2, gain: 0.25, lp: 700 });
        break;
      case "zombie_hurt":
        t({ type: "sawtooth", f0: 210, f1: 100, dur: 0.12, gain: 0.2, lp: 900 });
        n({ dur: 0.07, type: "lowpass", f0: 900, gain: 0.3 });
        break;
      case "zombie_die":
        t({ type: "sawtooth", f0: 150, f1: 38, dur: 0.55, gain: 0.3, lp: 600 });
        n({ dur: 0.22, type: "lowpass", f0: 600, f1: 150, gain: 0.3 });
        break;
      case "spit":
        n({ dur: 0.28, type: "bandpass", f0: 900, f1: 3200, q: 1.2, gain: 0.4 });
        t({ f0: 380, f1: 900, dur: 0.16, gain: 0.18 });
        break;
      case "fuse":
        t({ type: "square", f0: 880, dur: 0.07, gain: 0.12, lp: 2500 });
        break;
      case "explosion":
        n({ dur: 1, type: "lowpass", f0: 2600, f1: 70, gain: 1 });
        t({ f0: 85, f1: 24, dur: 0.75, gain: 0.8 });
        n({ dur: 0.25, type: "bandpass", f0: 1200, f1: 300, gain: 0.5 });
        break;
      case "build":
        for (let i = 0; i < 3; i++) {
          n({ dur: 0.06, type: "bandpass", f0: 650, q: 1.2, gain: 0.5, delay: i * 0.12 });
          t({ f0: 190, f1: 95, dur: 0.06, gain: 0.3, delay: i * 0.12 });
        }
        break;
      case "build_turret":
        t({ type: "square", f0: 300, f1: 600, dur: 0.18, gain: 0.15, lp: 2000 });
        n({ dur: 0.1, type: "bandpass", f0: 2000, q: 2, gain: 0.3, delay: 0.1 });
        t({ type: "square", f0: 700, dur: 0.1, gain: 0.12, delay: 0.2, lp: 2200 });
        break;
      case "hit_wood":
        n({ dur: 0.09, type: "bandpass", f0: 500, q: 1, gain: 0.45 });
        t({ f0: 150, f1: 80, dur: 0.07, gain: 0.25 });
        break;
      case "break":
        n({ dur: 0.45, type: "bandpass", f0: 600, f1: 180, q: 0.8, gain: 0.8 });
        t({ type: "square", f0: 95, f1: 38, dur: 0.3, gain: 0.3, lp: 600 });
        break;
      case "buy":
        t({ f0: 880, dur: 0.1, gain: 0.25 });
        t({ f0: 1320, dur: 0.22, gain: 0.25, delay: 0.08 });
        break;
      case "denied":
        t({ type: "square", f0: 150, f1: 105, dur: 0.18, gain: 0.2, lp: 700 });
        break;
      case "wave_start":
        t({ type: "sawtooth", f0: 110, dur: 1.4, gain: 0.25, attack: 0.25, lp: 500 });
        t({ type: "sawtooth", f0: 165, dur: 1.4, gain: 0.18, attack: 0.3, lp: 500 });
        t({ type: "sawtooth", f0: 233, dur: 1.4, gain: 0.12, attack: 0.35, lp: 500 });
        n({ dur: 0.9, type: "lowpass", f0: 400, f1: 60, gain: 0.4 });
        break;
      case "wave_end":
        [440, 554, 659, 880].forEach((f, i) => t({ f0: f, dur: 0.5, gain: 0.2, delay: i * 0.12, attack: 0.01 }));
        break;
      case "player_hurt":
        t({ type: "sawtooth", f0: 130, f1: 60, dur: 0.28, gain: 0.35, lp: 900 });
        n({ dur: 0.13, type: "lowpass", f0: 1400, gain: 0.35 });
        break;
      case "pickup":
        t({ f0: 600, f1: 1250, dur: 0.14, gain: 0.25 });
        break;
      case "heal":
        t({ f0: 500, dur: 0.12, gain: 0.2 });
        t({ f0: 750, dur: 0.12, gain: 0.2, delay: 0.1 });
        t({ f0: 1000, dur: 0.22, gain: 0.2, delay: 0.2 });
        break;
      case "ui_click":
        t({ type: "square", f0: 640, f1: 420, dur: 0.05, gain: 0.1, lp: 3000 });
        break;
      case "gameover":
        t({ type: "sawtooth", f0: 220, f1: 50, dur: 2, gain: 0.4, lp: 500, attack: 0.05 });
        n({ dur: 1.2, type: "lowpass", f0: 800, f1: 60, gain: 0.5 });
        break;
    }
  }

  // ---------- música procedural ----------
  startMusic(root: number, intensity = 0) {
    if (!this.ctx) return;
    this.root = root;
    this.intensity = intensity;
    if (this.musicOn) return;
    this.musicOn = true;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.step = 0;
    this.musicTimer = window.setInterval(() => this.pump(), 110);
  }
  stopMusic() {
    this.musicOn = false;
    if (this.musicTimer !== null) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
  }
  setMusicRoot(root: number) {
    this.root = root;
  }
  setIntensity(i: number) {
    this.intensity = i;
  }

  private pump() {
    const ctx = this.ctx;
    if (!ctx || !this.musicOn) return;
    if (this.nextTime < ctx.currentTime) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + 0.35) {
      this.musicStep(this.step, this.nextTime - ctx.currentTime);
      this.nextTime += STEP_DUR;
      this.step++;
    }
  }

  private musicStep(step: number, delay: number) {
    const bar = Math.floor(step / 16);
    const s = step % 16;
    const prog = [0, 0, -4, -2];
    const base = this.root * Math.pow(2, prog[bar % 4] / 12);
    const I = this.intensity;
    const M = (o: ToneOpts) => this.tone({ ...o, bus: "music", delay });
    const MN = (o: NoiseOpts) => this.noise({ ...o, bus: "music", delay });
    this.v = 1;
    this.p = 1;
    if (s === 0) {
      M({ type: "sawtooth", f0: base, dur: STEP_DUR * 15.5, gain: 0.2, attack: 0.8, lp: 170 });
      M({ type: "triangle", f0: base * 2, dur: STEP_DUR * 15.5, gain: 0.07, attack: 1.2, lp: 400 });
    }
    if (s % 8 === 0) M({ f0: 95, f1: 38, dur: 0.24, gain: I >= 1 ? 0.5 : 0.32 });
    if (s % 8 === 1 && I < 1) M({ f0: 80, f1: 38, dur: 0.18, gain: 0.16 });
    if (I >= 1 && s % 8 === 4) MN({ dur: 0.12, type: "bandpass", f0: 1800, q: 0.8, gain: 0.13 });
    if (I >= 0.5 && s % 2 === 0) MN({ dur: 0.04, type: "highpass", f0: 7000, gain: 0.05 });
    if (s === 8 && Math.random() < 0.55) {
      const sc = [0, 3, 5, 7, 10, 12, 15];
      const f = this.root * 4 * Math.pow(2, sc[Math.floor(Math.random() * sc.length)] / 12);
      M({ type: "triangle", f0: f, dur: 1.6, gain: 0.07, attack: 0.01, lp: 1800 });
    }
    if (I >= 2 && s % 2 === 0) {
      const arp = [0, 3, 7, 10, 7, 3];
      const f = base * 8 * Math.pow(2, arp[(step >> 1) % arp.length] / 12);
      M({ type: "square", f0: f, dur: 0.14, gain: 0.035, lp: 1100 });
    }
  }
}

export const audio = new AudioEngine();
