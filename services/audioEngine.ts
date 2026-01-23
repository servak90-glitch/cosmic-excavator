import { ResourceType } from '../types';

export enum MusicMode {
  SURFACE = 'SURFACE',
  DEEP = 'DEEP',
  CRYSTAL = 'CRYSTAL',
  VOID = 'VOID'
}

export enum MusicIntensity {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2
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
    { label: 'Determination', notes: [110, 220, 329.63, 440, 493.88], waveform: 'sine', density: 0.5 },
    { label: 'Golden Sand', notes: [196, 220, 246.94, 293.66, 329.63], waveform: 'sine', density: 0.7 },
    { label: 'Oasis Dream', notes: [220, 277.18, 329.63, 415.30, 440], waveform: 'triangle', density: 0.4 },
    { label: 'Desert Wind', notes: [164.81, 196, 220, 261.63, 293.66], waveform: 'sine', density: 0.65 },
    { label: 'First Light', notes: [246.94, 293.66, 329.63, 392, 440], waveform: 'triangle', density: 0.75 },
    { label: 'Brave Journey', notes: [220, 261.63, 329.63, 392, 493.88], waveform: 'sine', density: 0.55 },
    { label: 'Hope Rising', notes: [196, 246.94, 293.66, 349.23, 440], waveform: 'sine', density: 0.7 },
    { label: 'New Frontier', notes: [220, 277.18, 349.23, 440, 523.25], waveform: 'triangle', density: 0.6 }
  ],
  [MusicMode.CRYSTAL]: [
    { label: 'Ethereal Shine', notes: [523.25, 587.33, 659.25, 739.99, 783.99, 880], waveform: 'sine', density: 0.9 },
    { label: 'Frozen Echo', notes: [440, 493.88, 523.25, 587.33, 659.25], waveform: 'sine', density: 0.4 },
    { label: 'Geode Pulse', notes: [261.63, 329.63, 392, 523.25, 659.25], waveform: 'sine', density: 0.7 },
    { label: 'Resonance', notes: [440, 554.37, 659.25, 880], waveform: 'sine', density: 0.6 },
    { label: 'Prism Light', notes: [523.25, 659.25, 783.99, 1046.50], waveform: 'sine', density: 0.5 },
    { label: 'Crystal Cascade', notes: [392, 493.88, 587.33, 739.99, 880], waveform: 'sine', density: 0.8 },
    { label: 'Shimmer Dance', notes: [523.25, 622.25, 739.99, 880, 1046.50], waveform: 'sine', density: 0.45 },
    { label: 'Ice Cathedral', notes: [329.63, 440, 523.25, 659.25, 783.99], waveform: 'sine', density: 0.75 },
    { label: 'Frozen Stars', notes: [493.88, 587.33, 698.46, 830.61, 987.77], waveform: 'sine', density: 0.55 },
    { label: 'Diamond Rain', notes: [440, 523.25, 659.25, 783.99, 1046.50], waveform: 'sine', density: 0.65 }
  ],
  [MusicMode.DEEP]: [
    { label: 'Tension', notes: [164.81, 174.61, 196, 220, 246.94], waveform: 'triangle', density: 0.8 },
    { label: 'Heavy Metal', notes: [82.41, 110, 123.47, 164.81, 196], waveform: 'sawtooth', density: 0.5 },
    { label: 'Pressure', notes: [110, 116.54, 130.81, 164.81], waveform: 'triangle', density: 0.6 },
    { label: 'Iron Heart', notes: [73.42, 82.41, 110, 146.83], waveform: 'sawtooth', density: 0.7 },
    { label: 'Abyss Echo', notes: [55, 65.41, 82.41, 110], waveform: 'triangle', density: 0.4 },
    { label: 'Crushing Depths', notes: [98, 110, 123.47, 146.83, 174.61], waveform: 'sawtooth', density: 0.75 },
    { label: 'Molten Core', notes: [82.41, 92.50, 110, 130.81, 164.81], waveform: 'triangle', density: 0.65 },
    { label: 'Underground Pulse', notes: [65.41, 73.42, 82.41, 98, 110], waveform: 'sawtooth', density: 0.55 },
    { label: 'Stone Grind', notes: [110, 123.47, 138.59, 164.81, 196], waveform: 'triangle', density: 0.7 },
    { label: 'Tectonic Shift', notes: [73.42, 87.31, 110, 138.59, 174.61], waveform: 'sawtooth', density: 0.6 }
  ],
  [MusicMode.VOID]: [
    { label: 'Entropy', notes: [110, 116.54, 138.59, 146.83, 174.61, 220], waveform: 'sawtooth', density: 0.9 },
    { label: 'The End', notes: [55, 61.74, 65.41, 82.41, 110], waveform: 'triangle', density: 0.4 },
    { label: 'Singularity', notes: [440, 466.16, 554.37, 587.33], waveform: 'sine', density: 0.3 },
    { label: 'Null Point', notes: [27.5, 30.87, 41.2, 55], waveform: 'sawtooth', density: 0.8 },
    { label: 'Eternal Dark', notes: [55, 58.27, 61.74], waveform: 'triangle', density: 0.2 },
    { label: 'Void Whispers', notes: [82.41, 92.50, 110, 123.47, 146.83], waveform: 'sawtooth', density: 0.75 },
    { label: 'Reality Collapse', notes: [41.2, 46.25, 55, 61.74, 73.42], waveform: 'triangle', density: 0.35 },
    { label: 'Event Horizon', notes: [220, 233.08, 277.18, 293.66, 349.23], waveform: 'sine', density: 0.25 },
    { label: 'Cosmic Silence', notes: [27.5, 32.70, 41.2, 49.00], waveform: 'sawtooth', density: 0.85 },
    { label: 'Final Descent', notes: [55, 58.27, 65.41, 73.42, 82.41], waveform: 'triangle', density: 0.5 }
  ]
};


export class AudioEngine {
  private ctx: AudioContext | null = null;

  // Main Buses (Dry Volume)
  private masterBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private drillBus: GainNode | null = null;

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
  private motorGain: GainNode | null = null;

  // Steam (Overheat) Nodes
  private steamNoise: AudioBufferSourceNode | null = null;
  private steamFilter: BiquadFilterNode | null = null;
  private steamGain: GainNode | null = null;

  // Ambiance
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;

  // Music Layers
  private melodyBus: GainNode | null = null;
  private tensionBus: GainNode | null = null;
  private combatBus: GainNode | null = null;

  private currentMode: MusicMode = MusicMode.SURFACE;
  private currentIntensity: MusicIntensity = MusicIntensity.LOW;
  private currentVariationIndex: number = 0;
  private isRunning: boolean = false;
  private _isReady: boolean = false;

  // Phase 4 State
  private lastHeat: number = 0;
  private lfoPhase: number = 0;
  private drillMaterial: 'rock' | 'crystal' | 'metal' = 'rock';
  private overheatStartTime: number | null = null;

  // Modulation Nodes
  private droneLFO_L: OscillatorNode | null = null;
  private droneLFO_R: OscillatorNode | null = null;
  private droneLFO_GainL: GainNode | null = null;
  private droneLFO_GainR: GainNode | null = null;

  private pannerL: StereoPannerNode | null = null;
  private pannerR: StereoPannerNode | null = null;

  // Drill FM/Resonance
  private drillModulator: OscillatorNode | null = null;
  private drillModGain: GainNode | null = null;

  // Steam Turbulence
  private steamModulator: OscillatorNode | null = null;
  private steamModGain: GainNode | null = null;

  // CD System (Anti-Spam)
  private sfxCooldowns: Map<string, number> = new Map();

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

  async init(initialMusicVol: number = 0.5, initialSfxVol: number = 0.5, initialDrillVol: number = 0.5, musicMuted: boolean = false, sfxMuted: boolean = false, drillMuted: boolean = false) {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      this.setMusicVolume(musicMuted ? 0 : initialMusicVol);
      this.setSfxVolume(sfxMuted ? 0 : initialSfxVol);
      return;
    }

    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    if (!this.ctx) return;

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -12; // Порог чуть ниже для запаса
    this.compressor.knee.value = 40;       // Более мягкое колено
    this.compressor.ratio.value = 20;      // Жесткое лимитирование (20:1)
    this.compressor.attack.value = 0.001;  // Мгновенная атака
    this.compressor.release.value = 0.5;   // Плавное восстановление
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

    // Dynamic Layers
    this.melodyBus = this.ctx.createGain();
    this.tensionBus = this.ctx.createGain();
    this.combatBus = this.ctx.createGain();

    this.melodyBus.connect(this.musicBus);
    this.tensionBus.connect(this.musicBus);
    this.combatBus.connect(this.musicBus);

    this.melodyBus.gain.value = 1.0;
    this.tensionBus.gain.value = 0;
    this.combatBus.gain.value = 0;

    this.musicFxBus = this.ctx.createGain(); // Wet Send
    this.musicFxBus.connect(this.reverbNode);
    this.musicFxBus.connect(this.delayNode);

    // SFX
    this.sfxBus = this.ctx.createGain(); // Dry
    this.sfxBus.connect(this.masterBus);

    // Drill & Motor Bus
    this.drillBus = this.ctx.createGain();
    this.drillBus.connect(this.masterBus);

    this.sfxReverbBus = this.ctx.createGain(); // Wet Reverb Send
    this.sfxReverbBus.connect(this.reverbNode);

    this.sfxDelayBus = this.ctx.createGain(); // Wet Delay Send
    this.sfxDelayBus.connect(this.delayNode);

    // Set initial volumes
    this.setMusicVolume(musicMuted ? 0 : initialMusicVol);
    this.setSfxVolume(sfxMuted ? 0 : initialSfxVol);
    this.setDrillVolume(drillMuted ? 0 : initialDrillVol);

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

  setDrillVolume(vol: number) {
    if (!this.ctx || !this.drillBus) return;
    const t = this.ctx.currentTime;
    this.drillBus.gain.setTargetAtTime(vol, t, 0.1);
  }

  // --- CD SYSTEM ---
  private checkCooldown(id: string, ms: number = 80): boolean {
    const now = Date.now();
    const last = this.sfxCooldowns.get(id) || 0;
    if (now - last < ms) return false;
    this.sfxCooldowns.set(id, now);
    return true;
  }

  // --- HELPERS ---

  /**
   * Рассчитывает значение стереопанорамы (-1 до 1) на основе координаты X (0-100).
   * 50 - центр экрана (0 панорама).
   */
  private getPanValue(x?: number): number {
    if (x === undefined) return 0;
    // x передается в пределах 0-100 (координаты системы игры)
    // 0 -> -1.0, 50 -> 0.0, 100 -> 1.0
    const pan = (x / 50) - 1;
    return Math.max(-1, Math.min(1, pan));
  }

  /**
   * Рассчитывает громкость в зависимости от расстояния до бура (центр: 50, 40).
   * Возвращает множитель от 0.2 до 1.0.
   */
  private getDistanceVolume(x?: number, y?: number): number {
    if (x === undefined || y === undefined) return 1.0;

    // Центр бура в игровых координатах (0-100)
    const centerX = 50;
    const centerY = 40;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Максимальное расстояние (углы) ~70. 
    // На расстоянии 60 громкость падает до 30%
    const falloff = 1 - Math.min(0.7, distance / 80);
    return Math.max(0.3, falloff);
  }

  /**
   * Creates a Panner node if pan is needed.
   * Returns { panner, targetBus } where targetBus is the node to connect the source to.
   */
  private routeWithPan(pan: number, defaultBus: GainNode): { startNode: AudioNode; endNode: AudioNode } {
    if (!this.ctx || pan === 0) return { startNode: defaultBus, endNode: defaultBus };
    const panner = this.ctx.createStereoPanner();
    panner.pan.value = pan;
    panner.connect(defaultBus);
    return { startNode: panner, endNode: defaultBus };
  }

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

    // Pink Noise for Stick-Slip
    const buffer = this.createPinkNoise();
    this.drillNoise = this.ctx.createBufferSource();
    this.drillNoise.buffer = buffer;
    this.drillNoise.loop = true;

    // Main Drill Oscillator (Stick-Slip Driver / Carrier)
    this.drillOsc = this.ctx.createOscillator();
    this.drillOsc.type = 'sawtooth';
    this.drillOsc.frequency.value = 40;

    // FM Modulator for Metal
    this.drillModulator = this.ctx.createOscillator();
    this.drillModulator.type = 'sine';
    this.drillModulator.frequency.value = 150;
    this.drillModGain = this.ctx.createGain();
    this.drillModGain.gain.value = 0; // Default off
    this.drillModulator.connect(this.drillModGain);
    this.drillModGain.connect(this.drillOsc.frequency);
    this.drillModulator.start();

    // Filter for Resonance/Stick-Slip
    this.drillFilter = this.ctx.createBiquadFilter();
    this.drillFilter.type = 'lowpass';
    this.drillFilter.frequency.value = 100;
    this.drillFilter.Q.value = 2;

    this.drillGain = this.ctx.createGain();
    this.drillGain.gain.value = 0;

    this.motorGain = this.ctx.createGain();
    this.motorGain.gain.value = 0;

    this.drillNoise.connect(this.drillFilter);
    this.drillOsc.connect(this.motorGain);
    this.motorGain.connect(this.drillBus!);

    this.drillFilter.connect(this.drillGain);
    this.drillGain.connect(this.drillBus!);

    this.drillNoise.start();
    this.drillOsc.start();
  }

  private initSteamSound() {
    if (!this.ctx || !this.sfxBus || !this.sfxReverbBus) return;

    const buffer = this.createWhiteNoise();
    this.steamNoise = this.ctx.createBufferSource();
    this.steamNoise.buffer = buffer;
    this.steamNoise.loop = true;

    // Turbulence Modulator (Low freq noise/osc)
    this.steamModulator = this.ctx.createOscillator();
    this.steamModulator.type = 'sine';
    this.steamModulator.frequency.value = 8;
    this.steamModGain = this.ctx.createGain();
    this.steamModGain.gain.value = 0;
    this.steamModulator.start();

    this.steamFilter = this.ctx.createBiquadFilter();
    this.steamFilter.type = 'highpass';
    this.steamFilter.frequency.value = 1000;
    this.steamFilter.Q.value = 0.5;

    // Connect Turbulence to Filter Cutoff
    this.steamModGain.connect(this.steamFilter.frequency);

    this.steamGain = this.ctx.createGain();
    this.steamGain.gain.value = 0;

    this.steamNoise.connect(this.steamFilter);
    this.steamFilter.connect(this.steamGain);
    this.steamGain.connect(this.sfxBus);

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
    this.droneGain.gain.value = 0.15;

    // --- Stereo LFO Setup ---
    this.droneLFO_L = this.ctx.createOscillator();
    this.droneLFO_R = this.ctx.createOscillator();
    this.droneLFO_L.frequency.value = 0.1;
    this.droneLFO_R.frequency.value = 0.12; // Slightly different freq for depth

    this.droneLFO_GainL = this.ctx.createGain();
    this.droneLFO_GainR = this.ctx.createGain();
    this.droneLFO_GainL.gain.value = 50; // Filter mod depth (Hz)
    this.droneLFO_GainR.gain.value = 50;

    this.pannerL = this.ctx.createStereoPanner();
    this.pannerR = this.ctx.createStereoPanner();
    this.pannerL.pan.value = -0.5;
    this.pannerR.pan.value = 0.5;

    // Connect LFOs to Filter
    this.droneLFO_L.connect(this.droneLFO_GainL);
    this.droneLFO_R.connect(this.droneLFO_GainR);
    this.droneLFO_GainL.connect(this.droneFilter.frequency);
    this.droneLFO_GainR.connect(this.droneFilter.frequency);

    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);

    // Split to stereo path
    const leftPath = this.ctx.createGain();
    const rightPath = this.ctx.createGain();
    this.droneFilter.connect(leftPath);
    this.droneFilter.connect(rightPath);

    leftPath.connect(this.pannerL);
    rightPath.connect(this.pannerR);

    this.pannerL.connect(this.droneGain);
    this.pannerR.connect(this.droneGain);

    this.droneGain.connect(this.sfxBus);

    const verbSend = this.ctx.createGain();
    verbSend.gain.value = 0.5;
    this.droneGain.connect(verbSend);
    verbSend.connect(this.sfxReverbBus);

    this.droneLFO_L.start();
    this.droneLFO_R.start();
    this.droneOsc1.start();
    this.droneOsc2.start();
  }

  private startVariationRotator() {
    setInterval(() => {
      if (!this.isRunning) return;
      this.rotateVariation();
    }, 12000); // Смена вариации каждые 12 секунд (было 20)
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
      const intensity = this.currentIntensity;

      // 1. Melody Layer (Always active, but density might change)
      if (Math.random() < variation.density) {
        const scale = variation.notes;
        const freq = scale[Math.floor(Math.random() * scale.length)];
        this.playNote(freq, variation.waveform, 'melody');
      }

      // 2. Tension Layer (Low pulses)
      if (intensity >= MusicIntensity.MEDIUM && Math.random() < 0.4) {
        const scale = variation.notes;
        const freq = scale[0] / 2; // Octave lower root
        this.playNote(freq, 'sine', 'tension');
      }

      // 3. Combat Layer (Percussive rhythm)
      if (intensity === MusicIntensity.HIGH && Math.random() < 0.6) {
        const scale = variation.notes;
        const freq = scale[Math.floor(Math.random() * scale.length)] * 2; // Octave higher
        this.playNote(freq, 'sawtooth', 'combat');
      }

      // Adaptive Tempo
      const baseDelay = this.currentMode === MusicMode.VOID ? 200 : 600;
      const intensityMod = intensity === MusicIntensity.HIGH ? 0.5 : (intensity === MusicIntensity.MEDIUM ? 0.8 : 1.0);
      const delay = (baseDelay + Math.random() * 1500) * intensityMod;
      setTimeout(playTick, delay);
    };

    playTick();
  }

  private playNote(freq: number, type: OscillatorType, layer: 'melody' | 'tension' | 'combat' = 'melody') {
    if (!this.ctx || !this.musicBus || !this.musicFxBus) return;

    // Select bus based on layer
    let targetBus = this.melodyBus;
    if (layer === 'tension') targetBus = this.tensionBus;
    if (layer === 'combat') targetBus = this.combatBus;

    if (!targetBus) targetBus = this.musicBus;

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    osc.detune.value = (Math.random() - 0.5) * 10;

    const now = this.ctx.currentTime;
    env.gain.setValueAtTime(0, now);

    osc.connect(env);

    // Connect to specific Layer Bus -> Music Bus
    env.connect(targetBus);

    // Add Reverb/Delay wet send to melody and tension layers
    if (layer !== 'combat') {
      env.connect(this.musicFxBus);
    }

    // ВАЖНО: start() ДОЛЖЕН быть ПЕРЕД stop()
    osc.start(now);

    // Specific envelope per layer
    if (layer === 'combat') {
      env.gain.linearRampToValueAtTime(0.15, now + 0.01);
      env.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.stop(now + 0.5);
    } else if (layer === 'tension') {
      env.gain.linearRampToValueAtTime(0.1, now + 0.2);
      env.gain.exponentialRampToValueAtTime(0.001, now + 4.0);
      osc.stop(now + 4.1);
    } else {
      env.gain.linearRampToValueAtTime(0.1, now + 0.1);
      env.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
      osc.stop(now + 3.1);
    }

    // Clean up
    osc.onended = () => {
      osc.disconnect();
      env.disconnect();
    };
  }

  // --- UPDATES ---

  private crossfadeLayers(intensity: MusicIntensity) {
    if (!this.ctx || !this.melodyBus || !this.tensionBus || !this.combatBus) return;
    const now = this.ctx.currentTime;
    const rampTime = 2.0;

    // Reset all
    this.melodyBus.gain.setTargetAtTime(intensity === MusicIntensity.LOW ? 1.0 : 0.7, now, rampTime);
    this.tensionBus.gain.setTargetAtTime(intensity === MusicIntensity.MEDIUM ? 0.8 : 0, now, rampTime);
    this.combatBus.gain.setTargetAtTime(intensity === MusicIntensity.HIGH ? 0.9 : 0, now, rampTime);
  }


  update(heat: number, depth: number, isOverheated: boolean, isCombat: boolean = false, isBroken: boolean = false, resourceType?: ResourceType, isDrilling: boolean = false) {
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const oldMode = this.currentMode;
    if (depth < 5000) this.currentMode = MusicMode.SURFACE;
    else if (depth < 20000) this.currentMode = MusicMode.CRYSTAL;
    else if (depth < 50000) this.currentMode = MusicMode.DEEP;
    else this.currentMode = MusicMode.VOID;

    if (oldMode !== this.currentMode) {
      this.currentVariationIndex = 0;
    }

    // --- Intensity Calculation ---
    let targetIntensity = MusicIntensity.LOW;
    if (isCombat) targetIntensity = MusicIntensity.HIGH;
    else if (isOverheated || heat > 70) targetIntensity = MusicIntensity.MEDIUM;

    if (this.currentIntensity !== targetIntensity) {
      this.currentIntensity = targetIntensity;
      this.crossfadeLayers(targetIntensity);
    }

    // --- 1. DRONE SYNTH (Ambience) ---
    if (this.droneFilter && this.droneOsc1 && this.droneOsc2 && this.droneGain) {
      const heatCutoff = 100 + (heat * 20);
      const depthMod = Math.min(1.0, depth / 50000);

      const baseFilterFreq = heatCutoff * (1.0 - depthMod * 0.3);
      this.droneFilter.frequency.setTargetAtTime(baseFilterFreq, now, 0.5);

      const pitch = Math.max(30, 55 - (depth / 5000));
      this.droneOsc1.frequency.setTargetAtTime(pitch, now, 1.0);
      this.droneOsc2.frequency.setTargetAtTime(pitch * 1.01, now, 1.0);

      const droneVol = 0.15 + (depthMod * 0.1);
      this.droneGain.gain.setTargetAtTime(droneVol, now, 2.0);

      if (this.pannerL && this.pannerR) {
        const width = 0.2 + (depthMod * 0.6);
        this.pannerL.pan.setTargetAtTime(-width, now, 5.0);
        this.pannerR.pan.setTargetAtTime(width, now, 5.0);
      }
    }

    // --- 2. DRILL SYNTH (Physical Modeling) ---
    if (this.drillFilter && this.drillOsc && this.drillGain && this.drillModGain && this.motorGain) {
      // Motor background hum (proportional to heat/activity but always present if not broken)
      const motorTarget = isBroken ? 0 : Math.min(0.2, (heat / 100) * 0.15 + 0.05);
      this.motorGain.gain.setTargetAtTime(motorTarget, now, 0.5);

      // Drilling friction noise (only when isDrilling is true)
      const drillTarget = isDrilling && !isOverheated && !isBroken ? Math.min(0.4, (heat / 100) * 0.3 + 0.1) : 0;
      this.drillGain.gain.setTargetAtTime(drillTarget, now, 0.3);

      let material: 'rock' | 'crystal' | 'metal' = 'rock';
      if (resourceType) {
        const rt = resourceType.toLowerCase();
        if (['crystal', 'diamonds', 'ancient'].includes(rt)) material = 'crystal';
        else if (['iron', 'copper', 'gold', 'tech', 'uranium', 'platinum', 'void_shard'].includes(rt)) material = 'metal';
      }

      const rpm = 50 + (heat * 10);

      if (material === 'crystal') {
        this.drillFilter.type = 'bandpass';
        this.drillFilter.frequency.setTargetAtTime(2000 + rpm * 5, now, 0.2);
        this.drillFilter.Q.setTargetAtTime(10, now, 0.2);
        this.drillModGain.gain.setTargetAtTime(0, now, 0.2);
        this.drillOsc.frequency.setTargetAtTime(rpm * 4, now, 0.2);
      } else if (material === 'metal') {
        this.drillFilter.type = 'lowpass';
        this.drillFilter.frequency.setTargetAtTime(1500 + rpm * 2, now, 0.2);
        this.drillFilter.Q.setTargetAtTime(3, now, 0.2);
        this.drillModGain.gain.setTargetAtTime(200, now, 0.2);
        this.drillOsc.frequency.setTargetAtTime(rpm, now, 0.2);
      } else {
        this.drillFilter.type = 'lowpass';
        this.drillFilter.frequency.setTargetAtTime(200 + rpm * 2, now, 0.2);
        this.drillFilter.Q.setTargetAtTime(2, now, 0.2);
        this.drillModGain.gain.setTargetAtTime(0, now, 0.2);
        this.drillOsc.frequency.setTargetAtTime(rpm / 2, now, 0.2);
      }
    }

    // --- 3. STEAM SYNTH (Turbulence) ---
    if (this.steamGain && this.steamFilter && this.steamModGain) {
      if (isOverheated) {
        if (this.overheatStartTime === null) this.overheatStartTime = Date.now();
      } else {
        this.overheatStartTime = null;
      }

      const overheatDuration = this.overheatStartTime ? (Date.now() - this.overheatStartTime) : 0;
      const steamFadeOut = Math.max(0, 1.0 - (overheatDuration / 10000)); // Fades out over 10 seconds (10000ms)

      const coolingRate = Math.max(0, this.lastHeat - heat);
      const steamTarget = isOverheated ? Math.min(0.8, ((heat / 100) * 0.6 + (coolingRate * 0.05)) * steamFadeOut) : 0;

      this.steamGain.gain.setTargetAtTime(steamTarget, now, 0.1);

      if (isOverheated) {
        const turbDepth = 500 + (coolingRate * 100);
        this.steamModGain.gain.setTargetAtTime(turbDepth, now, 0.1);

        const baseFreq = 800 + (heat * 15);
        this.steamFilter.frequency.setTargetAtTime(baseFreq, now, 0.1);
      }
    }

    // --- 4. REVERB DEPTH (Dynamic Ambiance) ---
    if (this.sfxReverbBus) {
      // Increase reverb wetness with depth
      const depthRatio = Math.min(1.0, depth / 50000);
      const reverbWet = 0.3 + (depthRatio * 0.5); // 30% to 80% wet
      this.sfxReverbBus.gain.setTargetAtTime(reverbWet, now, 1.0);
    }

    this.lastHeat = heat;
  }

  // --- SFX API ---

  playClick(x?: number) {
    if (!this.ctx || !this.sfxBus || !this.checkCooldown('click', 50)) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    const pan = this.getPanValue(x);
    const { startNode } = this.routeWithPan(pan, this.sfxBus);

    osc.type = 'square';
    // [VARIATION] Slight pitch shift +/- 50 cents
    osc.detune.value = (Math.random() - 0.5) * 100;

    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);

    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(g);
    g.connect(startNode);
    osc.start();
    // Stop slightly after the ramp to prevent click
    osc.stop(t + 0.15);

    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
      if (startNode !== this.sfxBus) startNode.disconnect();
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

  playLegendary(x?: number) {
    if (!this.ctx || !this.sfxBus || !this.sfxReverbBus) return;
    const now = this.ctx.currentTime;

    const pan = this.getPanValue(x);
    const { startNode } = this.routeWithPan(pan, this.sfxBus);

    [440, 554.37, 659.25, 830.61, 880].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      g.gain.setValueAtTime(0, now + i * 0.08);
      g.gain.linearRampToValueAtTime(0.1, now + i * 0.08 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 1.5);

      osc.connect(g);
      g.connect(startNode);
      g.connect(this.sfxReverbBus!); // Wet Send (Global)

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 1.6);

      osc.onended = () => {
        osc.disconnect();
        g.disconnect();
      };
    });

    if (startNode !== this.sfxBus) {
      setTimeout(() => startNode.disconnect(), 2000);
    }
  }

  playBossHit(x?: number) {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;

    const pan = this.getPanValue(x);
    const { startNode } = this.routeWithPan(pan, this.sfxBus);

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
    noiseGain.connect(startNode);

    noise.start();
    noise.stop(t + 0.35);

    noise.onended = () => {
      noise.disconnect();
      noiseFilter.disconnect();
      noiseGain.disconnect();
      if (startNode !== this.sfxBus) startNode.disconnect();
    };
  }

  playExplosion(x?: number) {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;

    const pan = this.getPanValue(x);
    const { startNode } = this.routeWithPan(pan, this.sfxBus);

    // 1. IMPACT (Kick + SUB)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'triangle';
    // Deep impact dropping pitch from 120Hz to 20Hz
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.6);

    oscGain.gain.setValueAtTime(1.5, t); // Increased volume for "fatter" sound
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    osc.connect(oscGain);
    oscGain.connect(startNode);

    // 1b. SUB BOOM (Pure sine SUB)
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(45, t); // Deep sub 45Hz
    sub.frequency.exponentialRampToValueAtTime(25, t + 1.2); // Even deeper
    subGain.gain.setValueAtTime(0.8, t); // Boosted sub
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
    sub.connect(subGain);
    subGain.connect(startNode);

    // 2. RUMBLE (Pink Noise + Lowpass)
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createPinkNoise();

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(600, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(40, t + 4.0); // Slower, deeper closure

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(1.0, t); // More rumble
    noiseGain.gain.linearRampToValueAtTime(0.001, t + 4.5); // Very long tail

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(startNode);

    // 3. CRACKLE (High freq noise burst)
    const crackle = this.ctx.createBufferSource();
    crackle.buffer = this.createWhiteNoise();
    const crackleFilter = this.ctx.createBiquadFilter();
    crackleFilter.type = 'highpass';
    crackleFilter.frequency.value = 2000;

    const crackleGain = this.ctx.createGain();
    crackleGain.gain.setValueAtTime(0.4, t);
    crackleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    crackle.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(startNode);

    // START ALL
    osc.start(t);
    osc.stop(t + 0.8);
    sub.start(t);
    sub.stop(t + 1.8);
    noise.start(t);
    noise.stop(t + 4.5);
    crackle.start(t);
    crackle.stop(t + 0.5);

    // CLEANUP
    const cleanup = () => {
      osc.disconnect();
      oscGain.disconnect();
      sub.disconnect();
      subGain.disconnect();
      noise.disconnect();
      noiseFilter.disconnect();
      noiseGain.disconnect();
      crackle.disconnect();
      crackleFilter.disconnect();
      crackleGain.disconnect();
      if (startNode !== this.sfxBus) startNode.disconnect();
    };
    setTimeout(cleanup, 5000);
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

  playGeodeCollect(rarity: string, x?: number) {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;

    const pan = this.getPanValue(x);
    const distVol = this.getDistanceVolume(x, 40); // Y для жеод обычно в центре
    const { startNode } = this.routeWithPan(pan, this.sfxBus);

    if (rarity === 'LEGENDARY') {
      this.playLegendary(x);
      return;
    }

    const g = this.ctx.createGain();
    const osc = this.ctx.createOscillator();
    const baseVol = rarity === 'COMMON' ? 0.05 : 0.07;

    if (rarity === 'COMMON') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    } else if (rarity === 'UNCOMMON') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(660, t + 0.05);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.1);
      g.gain.setValueAtTime(0.07, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    } else if (rarity === 'RARE' || rarity === 'EPIC') {
      const isEpic = rarity === 'EPIC';
      const freqs = isEpic ? [880, 1108.73, 1318.51] : [440, 554.37, 659.25];
      freqs.forEach((f, i) => {
        const o = this.ctx!.createOscillator();
        const gainNode = this.ctx!.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, t + i * 0.05);
        gainNode.gain.setValueAtTime(0.05 * distVol, t + i * 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.3);
        o.connect(gainNode);
        gainNode.connect(startNode);
        o.start(t + i * 0.05);
        o.stop(t + i * 0.05 + 0.35);

        o.onended = () => {
          o.disconnect();
          gainNode.disconnect();
          // We don't disconnect panner here as it's shared for this batch
        };
      });
      // Safety disconnect panner after longest sound
      if (startNode !== this.sfxBus) {
        setTimeout(() => startNode.disconnect(), 600);
      }
      return;
    }

    osc.connect(g);
    g.connect(startNode);
    g.gain.setValueAtTime(baseVol * distVol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.start();
    osc.stop(t + 0.2);

    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
      if (startNode !== this.sfxBus) startNode.disconnect();
    };
  }

  playSatelliteCollect(x?: number) {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;

    const pan = this.getPanValue(x);
    const { startNode } = this.routeWithPan(pan, this.sfxBus);

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(2400, t + 0.05);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.2);

    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(g);
    g.connect(startNode);
    osc.start();
    osc.stop(t + 0.25);

    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
      if (startNode !== this.sfxBus) startNode.disconnect();
    };
  }

  playHazardTrigger(type: string) {
    if (!this.ctx || !this.sfxBus || !this.sfxReverbBus) return;
    const t = this.ctx.currentTime;

    if (type === 'CAVE_IN') {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createPinkNoise();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, t);
      filter.frequency.linearRampToValueAtTime(40, t + 1.5);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.6, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      noise.connect(filter);
      filter.connect(g);
      g.connect(this.sfxBus);
      noise.start();
      noise.stop(t + 1.6);
    } else if (type === 'GAS') {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createWhiteNoise();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, t);
      filter.frequency.linearRampToValueAtTime(5000, t + 1.0);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.1);
      g.gain.linearRampToValueAtTime(0, t + 1.0);
      noise.connect(filter);
      filter.connect(g);
      g.connect(this.sfxBus);
      noise.start();
      noise.stop(t + 1.1);
    } else if (type === 'MAGMA') {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(60, t);
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(8, t);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 20;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.2);
      g.gain.linearRampToValueAtTime(0, t + 1.2);
      osc.connect(g);
      g.connect(this.sfxBus);
      osc.start();
      lfo.start();
      osc.stop(t + 1.3);
      lfo.stop(t + 1.3);
    }
  }

  playHazardDamage() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start();
    osc.stop(t + 0.25);
    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }

  playCombatStart() {
    if (!this.ctx || !this.sfxBus || !this.sfxReverbBus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.3, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
    osc.connect(g);
    g.connect(this.sfxBus);
    g.connect(this.sfxReverbBus);
    osc.start();
    osc.stop(t + 1.1);
    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }

  playCombatEnd(victory: boolean) {
    if (!this.ctx || !this.sfxBus || !this.sfxReverbBus) return;
    const t = this.ctx.currentTime;
    if (victory) {
      this.playAchievement();
    } else {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.linearRampToValueAtTime(50, t + 0.5);
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
      osc.connect(g);
      g.connect(this.sfxBus);
      osc.start();
      osc.stop(t + 1.1);
      osc.onended = () => {
        osc.disconnect();
        g.disconnect();
      };
    }
  }

  playPlayerHit() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createPinkNoise();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    noise.connect(filter);
    filter.connect(g);
    g.connect(this.sfxBus);
    noise.start();
    noise.stop(t + 0.35);
  }

  playEvade() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.1);
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start();
    osc.stop(t + 0.2);
  }

  playBlock() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start();
    osc.stop(t + 0.25);
  }

  playAbilityActivation(type: string) {
    if (!this.ctx || !this.sfxBus || !this.sfxReverbBus) return;
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.connect(this.sfxBus);
    g.connect(this.sfxReverbBus);

    if (type === 'EMP_BURST') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.exponentialRampToValueAtTime(1000, t + 0.1);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.5);
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(g);
      osc.start();
      osc.stop(t + 0.7);
    } else if (type === 'THERMAL_STRIKE') {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createWhiteNoise();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, t);
      filter.frequency.exponentialRampToValueAtTime(200, t + 0.5);
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      noise.connect(filter);
      filter.connect(g);
      noise.start();
      noise.stop(t + 0.7);
    } else if (type === 'BARRIER') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      const mod = this.ctx.createOscillator();
      mod.frequency.value = 10;
      const modGain = this.ctx.createGain();
      modGain.gain.value = 20;
      mod.connect(modGain);
      modGain.connect(osc.frequency);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.1);
      g.gain.linearRampToValueAtTime(0, t + 0.8);
      osc.connect(g);
      osc.start();
      mod.start();
      osc.stop(t + 1);
      mod.stop(t + 1);
    } else if (type === 'OVERLOAD') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.5);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc.connect(g);
      osc.start();
      osc.stop(t + 0.9);
    }
  }

  playCollect() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.1);

    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.2, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(g);
    g.connect(this.sfxBus);

    osc.start();
    osc.stop(t + 0.3);
  }

  playUpgrade() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;

    // Плавный восходящий звук (Arpeggio style)
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      const startTime = t + (i * 0.05);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(g);
      g.connect(this.sfxBus!);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  playTravelStart() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(40, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 1.0);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.4, t + 0.5);
    g.gain.linearRampToValueAtTime(0.2, t + 1.5);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start();
    osc.stop(t + 1.6);
  }

  playTravelEnd() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 1.0);
    g.gain.setValueAtTime(0.3, t);
    g.gain.linearRampToValueAtTime(0, t + 1.2);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start();
    osc.stop(t + 1.3);
  }

  playLocationDiscover() {
    this.playAchievement();
  }

  playBaseBuild(facilityId?: string) {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(100 + i * 50, t + i * 0.2);
      g.gain.setValueAtTime(0.1, t + i * 0.2);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.15);
      osc.connect(g);
      g.connect(this.sfxBus);
      osc.start(t + i * 0.2);
      osc.stop(t + i * 0.2 + 0.2);
    }
  }

  playUIPanelOpen() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.05);
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start();
    osc.stop(t + 0.15);
  }

  playUIPanelClose() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.05);
    g.gain.setValueAtTime(0.04, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start();
    osc.stop(t + 0.15);
  }

  playUIError() {
    if (!this.ctx || !this.sfxBus || !this.checkCooldown('error', 200)) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.15);
    g.gain.setValueAtTime(0.1, t);
    g.gain.linearRampToValueAtTime(0, t + 0.2);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start();
    osc.stop(t + 0.25);
  }

  playMarketTrade() {
    if (!this.ctx || !this.sfxBus || !this.sfxReverbBus) return;
    const t = this.ctx.currentTime;

    // "Coin" sounds (High frequencies)
    [880, 1100, 1320].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + i * 0.05);

      g.gain.setValueAtTime(0, t + i * 0.05);
      g.gain.linearRampToValueAtTime(0.05, t + i * 0.05 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.2);

      osc.connect(g);
      g.connect(this.sfxBus!);
      g.connect(this.sfxReverbBus!);

      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.3);
    });

    // "Digital" confirmation (Slightly lower)
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, t + 0.1);
    osc2.frequency.linearRampToValueAtTime(880, t + 0.15);

    g2.gain.setValueAtTime(0, t + 0.1);
    g2.gain.linearRampToValueAtTime(0.04, t + 0.12);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc2.connect(g2);
    g2.connect(this.sfxBus);
    osc2.start(t + 0.1);
    osc2.stop(t + 0.35);
  }

  playCaravanActivity(type: 'send' | 'return') {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    if (type === 'send') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 1.0);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.5);
      g.gain.linearRampToValueAtTime(0, t + 1.2);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 1.0);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.2);
      g.gain.linearRampToValueAtTime(0, t + 1.2);
    }

    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start();
    osc.stop(t + 1.3);
  }

  playCaravanSend() {
    this.playCaravanActivity('send');
  }

  playCaravanReturn(success: boolean) {
    this.playCaravanActivity('return');
    if (success) {
      // Add a small chime for success
      this.playMarketTrade();
    } else {
      // Add a small glitch for loss
      this.playGlitch();
    }
  }

  playRaidAlarm() {
    if (!this.ctx || !this.sfxBus || !this.sfxDelayBus) return;
    const t = this.ctx.currentTime;

    // Classic Two-tone Siren
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      const startTime = t + i * 0.8;

      osc.frequency.setValueAtTime(600, startTime);
      osc.frequency.linearRampToValueAtTime(400, startTime + 0.4);

      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(0.15, startTime + 0.1);
      g.gain.linearRampToValueAtTime(0, startTime + 0.6);

      osc.connect(g);
      g.connect(this.sfxBus);
      g.connect(this.sfxDelayBus);

      osc.start(startTime);
      osc.stop(startTime + 0.7);
    }
  }

  playRaidRepelled() {
    if (!this.ctx || !this.sfxBus || !this.sfxReverbBus) return;
    const t = this.ctx.currentTime;

    // Victory flourish
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + i * 0.1);

      g.gain.setValueAtTime(0, t + i * 0.1);
      g.gain.linearRampToValueAtTime(0.15, t + i * 0.1 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.8);

      osc.connect(g);
      g.connect(this.sfxBus!);
      g.connect(this.sfxReverbBus!);

      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 1.0);
    });
  }

  playRaidBreeched() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;

    // Low, ominous impact
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.linearRampToValueAtTime(40, t + 1.0);

    g.gain.setValueAtTime(0.3, t);
    g.gain.linearRampToValueAtTime(0, t + 1.2);

    osc.connect(g);
    g.connect(this.sfxBus);

    osc.start();
    osc.stop(t + 1.3);

    // Glitchy overlay
    this.playGlitch();
  }

  playUITabSwitch() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    g.gain.setValueAtTime(0.03, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start();
    osc.stop(t + 0.1);
  }
}

export const audioEngine = new AudioEngine();