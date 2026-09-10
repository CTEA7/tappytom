type Bus = { master: GainNode; sfx: GainNode };

const VOICE_URL = "/tom-cant.mp3";

export class GameAudio {
  private ctx: AudioContext | null = null;
  private bus: Bus | null = null;
  private voiceBuf: AudioBuffer | null = null;
  private voiceBytes: ArrayBuffer | null = null;
  private voiceSrc: AudioBufferSourceNode | null = null;
  private voiceLoad: Promise<void> | null = null;
  muted = false;

  preload() {
    void this.fetchVoice();
  }

  unlock() {
    const ctx = this.ensure();
    if (ctx.state === "suspended") void ctx.resume();
    void this.decodeVoice();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    const bus = this.bus;
    if (!bus) return;
    const t = bus.master.context.currentTime;
    bus.master.gain.setTargetAtTime(muted ? 0 : 1, t, 0.02);
  }

  flap() {
    const ctx = this.ensure();
    if (this.muted) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    osc.connect(g);
    g.connect(this.sfx());
    osc.start(t);
    osc.stop(t + 0.12);

    this.noise(t, 0.05, 0.06, 1400);
  }

  point() {
    const ctx = this.ensure();
    if (this.muted) return;
    const t = ctx.currentTime;
    this.tone(t, 880, 0.07, 0.12, "square");
    this.tone(t + 0.07, 1320, 0.09, 0.12, "square");
  }

  hit() {
    const ctx = this.ensure();
    if (this.muted) return;
    const t = ctx.currentTime;
    this.noise(t, 0.14, 0.22, 600);
    this.tone(t, 140, 0.18, 0.22, "sine");
  }

  die() {
    this.ensure();
    if (this.muted) return;
    void this.playVoice(0.12);
  }

  swoosh() {
    const ctx = this.ensure();
    if (this.muted) return;
    this.noise(ctx.currentTime, 0.12, 0.08, 900);
  }

  private ensure(): AudioContext {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx({ latencyHint: "interactive" });
      const master = this.ctx.createGain();
      const sfx = this.ctx.createGain();
      sfx.gain.value = 0.9;
      master.gain.value = this.muted ? 0 : 1;
      sfx.connect(master);
      master.connect(this.ctx.destination);
      this.bus = { master, sfx };
    }
    return this.ctx;
  }

  private sfx(): GainNode {
    this.ensure();
    return this.bus!.sfx;
  }

  private fetchVoice(): Promise<void> {
    if (this.voiceBytes || this.voiceBuf) return Promise.resolve();
    if (this.voiceLoad) return this.voiceLoad;
    this.voiceLoad = fetch(VOICE_URL)
      .then((r) => {
        if (!r.ok) throw new Error("voice");
        return r.arrayBuffer();
      })
      .then((buf) => {
        this.voiceBytes = buf;
      })
      .catch(() => {
        this.voiceLoad = null;
      });
    return this.voiceLoad;
  }

  private async decodeVoice() {
    await this.fetchVoice();
    if (this.voiceBuf || !this.voiceBytes) return;
    try {
      this.voiceBuf = await this.ensure().decodeAudioData(this.voiceBytes.slice(0));
    } catch {
      this.voiceBuf = null;
    }
  }

  private async playVoice(delay: number) {
    this.unlock();
    await this.decodeVoice();
    if (this.muted || !this.voiceBuf) return;
    const ctx = this.ensure();
    try {
      this.voiceSrc?.stop();
    } catch {
      /* already stopped */
    }
    const src = ctx.createBufferSource();
    src.buffer = this.voiceBuf;
    const g = ctx.createGain();
    g.gain.value = 1.4;
    src.connect(g);
    g.connect(this.sfx());
    src.start(ctx.currentTime + delay);
    this.voiceSrc = src;
  }

  private tone(when: number, freq: number, dur: number, vol: number, type: OscillatorType) {
    const ctx = this.ensure();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol, when + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(g);
    g.connect(this.sfx());
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }

  private noise(when: number, dur: number, vol: number, cutoff: number) {
    const ctx = this.ensure();
    const n = 2 * ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.sfx());
    src.start(when);
    src.stop(when + dur + 0.02);
  }
}
