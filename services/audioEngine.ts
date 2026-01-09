
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
  private masterBus: GainNode | null = null;
  
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  
  private currentMode: MusicMode = MusicMode.SURFACE;
  private currentVariationIndex: number = 0;
  private isRunning: boolean = false;

  async init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return;
    }

    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.masterBus = this.ctx.createGain();
    this.masterBus.gain.setValueAtTime(0.3, this.ctx.currentTime);
    this.masterBus.connect(this.ctx.destination);

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(150, this.ctx.currentTime);
    this.droneFilter.Q.setValueAtTime(4, this.ctx.currentTime);

    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sawtooth';
    this.droneOsc2.frequency.setValueAtTime(55.5, this.ctx.currentTime);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);
    this.droneFilter.connect(droneGain);
    droneGain.connect(this.masterBus);

    this.droneOsc1.start();
    this.droneOsc2.start();

    this.isRunning = true;
    this.startGenerativeSequencer();
    this.startVariationRotator();

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  private startVariationRotator() {
    // Switch musical variation every 20 seconds to keep it fresh
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
    console.debug(`[AUDIO] Switching variation to: ${variations[nextIndex].label}`);
  }

  private startGenerativeSequencer() {
    const playTick = () => {
      if (!this.ctx || !this.isRunning) return;
      
      const variations = VARIATIONS[this.currentMode];
      const variation = variations[this.currentVariationIndex];
      
      // Only play if we hit the "density" check
      if (Math.random() < variation.density) {
        const scale = variation.notes;
        const freq = scale[Math.floor(Math.random() * scale.length)];
        
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        
        osc.type = variation.waveform;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        g.gain.setValueAtTime(0, this.ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.5);
        
        osc.connect(g);
        g.connect(this.masterBus!);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 2.6);
      }
      
      const baseDelay = this.currentMode === MusicMode.VOID ? 200 : 600;
      const delay = baseDelay + Math.random() * 1500;
      setTimeout(playTick, delay);
    };
    
    playTick();
  }

  update(heat: number, depth: number) {
    if (!this.ctx || !this.droneFilter || !this.droneOsc1) return;

    const oldMode = this.currentMode;
    if (depth < 5000) this.currentMode = MusicMode.SURFACE;
    else if (depth < 20000) this.currentMode = MusicMode.CRYSTAL;
    else if (depth < 50000) this.currentMode = MusicMode.DEEP;
    else this.currentMode = MusicMode.VOID;

    // Reset variation index if mode changed to ensure we start fresh
    if (oldMode !== this.currentMode) {
      this.currentVariationIndex = 0;
    }

    const f = 100 + (heat * 30);
    this.droneFilter.frequency.setTargetAtTime(f, this.ctx.currentTime, 0.1);

    const p = 55 - (depth / 10000);
    this.droneOsc1.frequency.setTargetAtTime(Math.max(30, p), this.ctx.currentTime, 0.5);
    this.droneOsc2!.frequency.setTargetAtTime(Math.max(30.5, p + 0.5), this.ctx.currentTime, 0.5);
  }

  playClick() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.05);
    g.gain.setValueAtTime(0.03, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(g);
    g.connect(this.masterBus!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
}

export const audioEngine = new AudioEngine();
