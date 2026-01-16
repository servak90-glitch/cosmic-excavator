
export enum MusicMode {
  SURFACE = 'SURFACE',
  DEEP = 'DEEP',
  CRYSTAL = 'CRYSTAL',
  VOID = 'VOID'
}

interface ScaleVariation {
  notes: number[];
  waveform: OscillatorType;
  density: number; // Probability of notes playing
  label: string;
}

const VARIATIONS: Record<MusicMode, ScaleVariation[]> = {
  [MusicMode.SURFACE]: [
    { label: 'Heroic Start', notes: [220, 246.94, 261.63, 293.66, 329.63, 440], waveform: 'sine', density: 0.8 },
    { label: 'Dusty Horizon', notes: [220, 261.63, 293.66, 349.23, 392], waveform: 'triangle', density: 0.6 },
    { label: 'Determination', notes: [110, 220, 329.63, 440, 493.88], waveform: 'sine', density: 0.5 }
  ],
  [MusicMode.CRYSTAL]: [
    { label: 'Ethereal Shine', notes: [523.25, 587.33, 659.25, 739.99, 783.99, 880], waveform: 'sine', density: 0.9 },
    { label: 'Frozen Echo', notes: [440, 493.88, 523.25, 587.33, 659.25], waveform: 'sine', density: 0.4 },
    { label: 'Geode Pulse', notes: [261.63, 329.63, 392, 523.25, 659.25], waveform: 'sine', density: 0.7 }
  ],
  [MusicMode.DEEP]: [
    { label: 'Tension', notes: [164.81, 174.61, 196, 220, 246.94], waveform: 'triangle', density: 0.8 },
    { label: 'Heavy Metal', notes: [82.41, 110, 123.47, 164.81, 196], waveform: 'sawtooth', density: 0.5 },
    { label: 'Pressure', notes: [110, 116.54, 130.81, 164.81], waveform: 'triangle', density: 0.6 }
  ],
  [MusicMode.VOID]: [
    { label: 'Entropy', notes: [110, 116.54, 138.59, 146.83, 174.61, 220], waveform: 'sawtooth', density: 0.9 },
    { label: 'The End', notes: [55, 61.74, 65.41, 82.41, 110], waveform: 'triangle', density: 0.4 },
    { label: 'Singularity', notes: [440, 466.16, 554.37, 587.33], waveform: 'sine', density: 0.3 }
  ]
};

export class AudioEngine {
  private ctx: AudioContext | null = null;

  // Main Buses (Dry Volume)
  private masterBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;

  // Dynamics Processing (Fixes Crackling/Clipping)
  private compressor: DynamicsCompressorNode | null = null;

  // FX Send Buses (Wet Volume Control)
  private musicFxBus: GainNode | null = null;
  private sfxReverbBus: GainNode | null = null;
  private sfxDelayBus: GainNode | null = null;

  // Effects
  private reverbNode: ConvolverNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;

  // Drill Synth Nodes
  private drillNoise: AudioBufferSourceNode | null = null;
  private drillFilter: BiquadFilterNode | null = null;
  private drillGain: GainNode | null = null;
  private drillOsc: OscillatorNode | null = null;

  // Steam (Overheat) Nodes
  private steamNoise: AudioBufferSourceNode | null = null;
  private steamFilter: BiquadFilterNode | null = null;
  private steamGain: GainNode | null = null;

  // Ambiance
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;

  private currentMode: MusicMode = MusicMode.SURFACE;
  private currentVariationIndex: number = 0;
  private isRunning: boolean = false;
  private _isReady: boolean = false;

  public get isReady(): boolean {
    return this._isReady && !!this.ctx && this.ctx.state === 'running';
  }

  /* 
   * HARDENING FIX: 
   * Attempts to resume initialization if previously blocked by browser autoplay policy.
   * valid user interaction defaults to click/touch events.
   */
  async tryResume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
        this._isReady = true;
        console.log("[AudioEngine] Context Resumed Successfully");
      } catch (e) {
        console.warn("[AudioEngine] Resume Failed", e);
      }
    }
  }

  async init(initialMusicVol: number = 0.5, initialSfxVol: number = 0.5, musicMuted: boolean = false, sfxMuted: boolean = false) {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      this.setMusicVolume(musicMuted ? 0 : initialMusicVol);
      this.setSfxVolume(sfxMuted ? 0 : initialSfxVol);
      return;
    }

    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    if (!this.ctx) return;

    // --- 0. Dynamics Compressor (CRITICAL FIX FOR CRACKLING) ---
    // Prevents the signal from exceeding 0dB which causes clipping/crackling
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -10; // Start compressing at -10dB
    this.compressor.knee.value = 30; // Smooth transition
    this.compressor.ratio.value = 12; // High compression ratio to act as a limiter
    this.compressor.attack.value = 0.003; // Fast attack
    this.compressor.release.value = 0.25;
    this.compressor.connect(this.ctx.destination);

    // --- 1. Master Bus Structure ---
    this.masterBus = this.ctx.createGain();
    this.masterBus.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.masterBus.connect(this.compressor); // Connect Master -> Compressor -> Destination

    // --- 2. Effects Setup ---
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this.createImpulseResponse(2.0, 2.0); // 2sec decay
    const reverbGain = this.ctx.createGain();
    reverbGain.gain.value = 0.3;
    this.reverbNode.connect(reverbGain);
    reverbGain.connect(this.masterBus);

    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.value = 0.4;
    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.value = 0.3;
    const delayOutGain = this.ctx.createGain();
    delayOutGain.gain.value = 0.2;

    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(delayOutGain);
    delayOutGain.connect(this.masterBus);

    // --- 3. Bus Creation & Routing ---

    // Music
    this.musicBus = this.ctx.createGain(); // Dry
    this.musicBus.connect(this.masterBus);

    this.musicFxBus = this.ctx.createGain(); // Wet Send
    this.musicFxBus.connect(this.reverbNode);
    this.musicFxBus.connect(this.delayNode);

    // SFX
    this.sfxBus = this.ctx.createGain(); // Dry
    this.sfxBus.connect(this.masterBus);

    this.sfxReverbBus = this.ctx.createGain(); // Wet Reverb Send
    this.sfxReverbBus.connect(this.reverbNode);

    this.sfxDelayBus = this.ctx.createGain(); // Wet Delay Send
    this.sfxDelayBus.connect(this.delayNode);

    // Set initial volumes
    this.setMusicVolume(musicMuted ? 0 : initialMusicVol);
    this.setSfxVolume(sfxMuted ? 0 : initialSfxVol);

    // --- 4. Synths ---
    this.initDrillSound();
    this.initSteamSound();
    this.initDrone();

    this.isRunning = true;
    this._isReady = true; // Mark as ready
    this.startGenerativeSequencer();
    this.startVariationRotator();

    if (this.ctx.state === 'suspended') {
      console.warn("[AudioEngine] Context Suspended! Waiting for user gesture...");
      // We don't await here to avoid blocking init, but we flag it.
      this._isReady = false;
    } else {
      console.log("[AudioEngine] Initialized and Running");
    }
  }

  // --- VOLUME CONTROLS (Controls BOTH Dry and FX Sends) ---
  setMusicVolume(vol: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Control Dry
    if (this.musicBus) this.musicBus.gain.setTargetAtTime(vol, t, 0.1);
    // Control Wet (Input to FX drops to 0 when vol is 0)
    if (this.musicFxBus) this.musicFxBus.gain.setTargetAtTime(vol, t, 0.1);
  }

  setSfxVolume(vol: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Control Dry
    if (this.sfxBus) this.sfxBus.gain.setTargetAtTime(vol, t, 0.1);
    // Control Wet
    if (this.sfxReverbBus) this.sfxReverbBus.gain.setTargetAtTime(vol, t, 0.1);
    if (this.sfxDelayBus) this.sfxDelayBus.gain.setTargetAtTime(vol, t, 0.1);
  }

  // --- HELPERS ---

  private createImpulseResponse(duration: number, decay: number): AudioBuffer {
    const rate = this.ctx!.sampleRate;
    const length = rate * duration;
    const impulse = this.ctx!.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const e = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * e;
      right[i] = (Math.random() * 2 - 1) * e;
    }
    return impulse;
  }

  private createPinkNoise(): AudioBuffer {
    const bufferSize = 4096 * 4;
    const b = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = b.getChannelData(0);
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }
    return b;
  }

  private createWhiteNoise(): AudioBuffer {
    const bufferSize = 2 * this.ctx!.sampleRate;
    const b = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = b.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return b;
  }

  // --- SYNTHS ---

  private initDrillSound() {
    if (!this.ctx || !this.sfxBus) return;

    const buffer = this.createPinkNoise();
    this.drillNoise = this.ctx.createBufferSource();
    this.drillNoise.buffer = buffer;
    this.drillNoise.loop = true;

    this.drillOsc = this.ctx.createOscillator();
    this.drillOsc.type = 'sawtooth';
    this.drillOsc.frequency.value = 40;

    this.drillFilter = this.ctx.createBiquadFilter();
    this.drillFilter.type = 'lowpass';
    this.drillFilter.frequency.value = 100;
    this.drillFilter.Q.value = 2;

    this.drillGain = this.ctx.createGain();
    this.drillGain.gain.value = 0;

    this.drillNoise.connect(this.drillFilter);
    this.drillOsc.connect(this.drillFilter);
    this.drillFilter.connect(this.drillGain);
    this.drillGain.connect(this.sfxBus);

    this.drillNoise.start();
    this.drillOsc.start();
  }

  private initSteamSound() {
    if (!this.ctx || !this.sfxBus || !this.sfxReverbBus) return;

    const buffer = this.createWhiteNoise();
    this.steamNoise = this.ctx.createBufferSource();
    this.steamNoise.buffer = buffer;
    this.steamNoise.loop = true;

    this.steamFilter = this.ctx.createBiquadFilter();
    this.steamFilter.type = 'highpass';
    this.steamFilter.frequency.value = 1000;
    this.steamFilter.Q.value = 0.5;

    this.steamGain = this.ctx.createGain();
    this.steamGain.gain.value = 0;

    this.steamNoise.connect(this.steamFilter);
    this.steamFilter.connect(this.steamGain);

    // Connect to Dry Bus
    this.steamGain.connect(this.sfxBus);

    // Connect to Wet Bus (Controlled by Volume now)
    const steamVerb = this.ctx.createGain();
    steamVerb.gain.value = 0.3;
    this.steamGain.connect(steamVerb);
    steamVerb.connect(this.sfxReverbBus);

    this.steamNoise.start();
  }

  private initDrone() {
    if (!this.ctx || !this.sfxBus || !this.sfxReverbBus) return;

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(150, this.ctx.currentTime);
    this.droneFilter.Q.setValueAtTime(1, this.ctx.currentTime);

    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(55.5, this.ctx.currentTime);

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);
    this.droneFilter.connect(this.droneGain);

    // Connect to Dry Bus
    this.droneGain.connect(this.sfxBus);

    // Connect to Wet Bus
    const verbSend = this.ctx.createGain();
    verbSend.gain.value = 0.5;
    this.droneGain.connect(verbSend);
    verbSend.connect(this.sfxReverbBus);

    this.droneOsc1.start();
    this.droneOsc2.start();
  }

  private startVariationRotator() {
    setInterval(() => {
      if (!this.isRunning) return;
      this.rotateVariation();
    }, 20000);
  }

  private rotateVariation() {
    const variations = VARIATIONS[this.currentMode];
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * variations.length);
    } while (nextIndex === this.currentVariationIndex && variations.length > 1);

    this.currentVariationIndex = nextIndex;
  }

  private startGenerativeSequencer() {
    const playTick = () => {
      if (!this.ctx || !this.isRunning) return;

      const variations = VARIATIONS[this.currentMode];
      const variation = variations[this.currentVariationIndex];

      if (Math.random() < variation.density) {
        const scale = variation.notes;
        const freq = scale[Math.floor(Math.random() * scale.length)];
        this.playNote(freq, variation.waveform);
      }

      const baseDelay = this.currentMode === MusicMode.VOID ? 200 : 600;
      const delay = baseDelay + Math.random() * 1500;
      setTimeout(playTick, delay);
    };

    playTick();
  }

  private playNote(freq: number, type: OscillatorType) {
    if (!this.ctx || !this.musicBus || !this.musicFxBus) return;

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    osc.detune.value = (Math.random() - 0.5) * 10;

    const now = this.ctx.currentTime;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.1, now + 0.1);
    env.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

    osc.connect(env);

    // Connect to Buses (Dry & Wet)
    env.connect(this.musicBus);
    env.connect(this.musicFxBus);

    osc.start();
    osc.stop(now + 3.1);

    // Clean up to prevent memory leak / crackling
    osc.onended = () => {
      osc.disconnect();
      env.disconnect();
    };
  }

  // --- UPDATES ---

  update(heat: number, depth: number, isOverheated: boolean) {
    if (!this.ctx) return;

    const oldMode = this.currentMode;
    if (depth < 5000) this.currentMode = MusicMode.SURFACE;
    else if (depth < 20000) this.currentMode = MusicMode.CRYSTAL;
    else if (depth < 50000) this.currentMode = MusicMode.DEEP;
    else this.currentMode = MusicMode.VOID;

    if (oldMode !== this.currentMode) {
      this.currentVariationIndex = 0;
    }

    if (this.droneFilter && this.droneOsc1 && this.droneOsc2) {
      const cutoff = 100 + (heat * 20);
      this.droneFilter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.5);

      const pitch = Math.max(30, 55 - (depth / 5000));
      this.droneOsc1.frequency.setTargetAtTime(pitch, this.ctx.currentTime, 1.0);
      this.droneOsc2.frequency.setTargetAtTime(pitch * 1.01, this.ctx.currentTime, 1.0);
    }

    if (this.drillFilter && this.drillOsc && this.drillGain) {
      const targetGain = isOverheated ? 0 : Math.min(0.4, (heat / 100) * 0.5 + 0.05);
      const actualGain = heat > 0 ? targetGain : 0;

      this.drillGain.gain.setTargetAtTime(actualGain, this.ctx.currentTime, 0.2);

      const rpm = 50 + (heat * 10);
      this.drillFilter.frequency.setTargetAtTime(rpm * 2, this.ctx.currentTime, 0.1);
      this.drillOsc.frequency.setTargetAtTime(rpm / 2, this.ctx.currentTime, 0.1);
    }

    if (this.steamGain && this.steamFilter) {
      const steamTarget = isOverheated ? Math.pow(heat / 100, 2) * 0.6 : 0;
      this.steamGain.gain.setTargetAtTime(steamTarget, this.ctx.currentTime, 0.1);

      if (isOverheated) {
        this.steamFilter.frequency.setTargetAtTime(800 + (heat * 15), this.ctx.currentTime, 0.1);
      }
    }
  }

  // --- SFX API ---

  playClick() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'square';
    // [VARIATION] Slight pitch shift +/- 50 cents
    osc.detune.value = (Math.random() - 0.5) * 100;

    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);

    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start();
    // Stop slightly after the ramp to prevent click
    osc.stop(t + 0.15);

    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }

  playLaser() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sawtooth';
    // [VARIATION] High variation for rapid fire
    osc.detune.value = (Math.random() - 0.5) * 200;

    osc.frequency.setValueAtTime(800 + Math.random() * 50, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);

    g.gain.setValueAtTime(0.08, t); // Slightly reduced volume
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(g);
    g.connect(this.sfxBus);

    osc.start();
    osc.stop(t + 0.2);

    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }

  playAlarm() {
    if (!this.ctx || !this.sfxBus || !this.sfxDelayBus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sawtooth';
    // [VARIATION]
    osc.detune.value = (Math.random() - 0.5) * 50;

    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.linearRampToValueAtTime(800, t + 0.2);
    osc.frequency.linearRampToValueAtTime(1200, t + 0.4);

    g.gain.setValueAtTime(0.1, t);
    g.gain.linearRampToValueAtTime(0, t + 0.6);

    osc.connect(g);
    g.connect(this.sfxBus);
    g.connect(this.sfxDelayBus); // Wet Send via Volume Controlled Bus

    osc.start();
    osc.stop(t + 0.65);

    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }

  playLegendary() {
    if (!this.ctx || !this.sfxBus || !this.sfxReverbBus) return;
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 830.61, 880].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      g.gain.setValueAtTime(0, now + i * 0.08);
      g.gain.linearRampToValueAtTime(0.1, now + i * 0.08 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 1.5);

      osc.connect(g);
      g.connect(this.sfxBus!);
      g.connect(this.sfxReverbBus!); // Wet Send

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 1.6);

      osc.onended = () => {
        osc.disconnect();
        g.disconnect();
      };
    });
  }

  playBossHit() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.drillNoise?.buffer || this.createPinkNoise();

    // [VARIATION] Pitch shift the noise slightly
    noise.playbackRate.value = 0.8 + Math.random() * 0.4;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    // [VARIATION] Filter cutoff variation
    noiseFilter.frequency.setValueAtTime(800 + Math.random() * 400, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 0.2);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxBus);

    noise.start();
    noise.stop(t + 0.35);

    noise.onended = () => {
      noise.disconnect();
      noiseFilter.disconnect();
      noiseGain.disconnect();
    };
  }

  playExplosion() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;

    // 1. IMPACT (Kick)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'triangle';
    // Deep impact dropping pitch
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(10, t + 0.4);

    oscGain.gain.setValueAtTime(1.0, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(oscGain);
    oscGain.connect(this.sfxBus);

    // 2. RUMBLE (Pink Noise + Lowpass)
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createPinkNoise();

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(400, t);
    noiseFilter.frequency.linearRampToValueAtTime(100, t + 1.5); // Filter closes down

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5); // Long tail

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxBus);

    // 3. CRACKLE (High freq noise burst)
    const crackle = this.ctx.createBufferSource();
    crackle.buffer = this.createWhiteNoise();
    const crackleFilter = this.ctx.createBiquadFilter();
    crackleFilter.type = 'highpass';
    crackleFilter.frequency.value = 1000;

    const crackleGain = this.ctx.createGain();
    crackleGain.gain.setValueAtTime(0.3, t);
    crackleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    crackle.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(this.sfxBus);

    // START ALL
    osc.start(t);
    osc.stop(t + 0.5);
    noise.start(t);
    noise.stop(t + 2.0);
    crackle.start(t);
    crackle.stop(t + 0.3);

    // CLEANUP
    const cleanup = () => {
      // Simple heuristic cleanup or fire-and-forget
      // In a real engine, we'd track these nodes
    };
    setTimeout(cleanup, 2000);
  }

  playFusion() {
    if (!this.ctx || !this.sfxBus || !this.sfxReverbBus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(50, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 2.0);

    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.2, t + 1.5);
    g.gain.linearRampToValueAtTime(0, t + 2.0);

    osc.connect(g);
    g.connect(this.sfxBus);
    g.connect(this.sfxReverbBus);

    osc.start();
    osc.stop(t + 2.1);

    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }

  playLog() {
    if (!this.ctx || !this.sfxBus || !this.sfxDelayBus) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.linearRampToValueAtTime(1800, t + 0.05);

    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(g);
    g.connect(this.sfxBus);
    g.connect(this.sfxDelayBus);

    osc.start();
    osc.stop(t + 0.15);

    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }

  playGlitch() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, t);

    lfo.type = 'square';
    lfo.frequency.setValueAtTime(50, t);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 500;

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    g.gain.setValueAtTime(0.1, t);
    g.gain.linearRampToValueAtTime(0, t + 0.3);

    osc.connect(g);
    g.connect(this.sfxBus);

    osc.start();
    lfo.start();
    osc.stop(t + 0.35);
    lfo.stop(t + 0.35);

    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
      lfo.disconnect();
      lfoGain.disconnect();
    };
  }

  playAchievement() {
    if (!this.ctx || !this.sfxBus || !this.sfxReverbBus) return;
    const t = this.ctx.currentTime;

    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.1);

      g.gain.setValueAtTime(0, t + i * 0.1);
      g.gain.linearRampToValueAtTime(0.1, t + i * 0.1 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.5);

      osc.connect(g);
      g.connect(this.sfxBus!);
      g.connect(this.sfxReverbBus!);

      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.6);

      osc.onended = () => {
        osc.disconnect();
        g.disconnect();
      };
    });
  }
}

export const audioEngine = new AudioEngine();