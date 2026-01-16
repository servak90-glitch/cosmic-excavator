/**
 * TunnelAtmosphere.ts
 * 
 * [DEV_CONTEXT: ISOLATION] Модуль атмосферных эффектов туннеля.
 * Создаёт плавающие обломки, туман по глубине и визуальные предупреждения об опасностях.
 * 
 * Интеграция: импорт в PixiOverlay.tsx, вызов init() и update() в тикере.
 */

import { Container, Sprite, Texture, Graphics, BlurFilter } from 'pixi.js';

// --- TYPES ---

export interface AtmosphereConfig {
  screenWidth: number;
  screenHeight: number;
}

interface FloatingDebris {
  sprite: Sprite;
  x: number;
  y: number;
  z: number; // Parallax depth (0.2 - 1.0)
  rotationSpeed: number;
  size: number;
}

interface FogLayer {
  graphics: Graphics;
  alpha: number;
}

export interface HazardEvent {
  type: 'CAVE_IN' | 'GAS_POCKET' | 'MAGMA_FLOW';
  intensity: number; // 0-1
  duration: number;
  elapsed: number;
}

// --- TEXTURES ---

const generateTextures = (): { rock: Texture; rockLarge: Texture } => {
  // Rock texture (small)
  const rockCanvas = document.createElement('canvas');
  rockCanvas.width = 8;
  rockCanvas.height = 8;
  const rockCtx = rockCanvas.getContext('2d')!;
  rockCtx.fillStyle = '#4a4a4a';
  rockCtx.beginPath();
  rockCtx.moveTo(4, 0);
  rockCtx.lineTo(8, 3);
  rockCtx.lineTo(7, 8);
  rockCtx.lineTo(1, 7);
  rockCtx.lineTo(0, 3);
  rockCtx.closePath();
  rockCtx.fill();
  rockCtx.strokeStyle = '#666';
  rockCtx.lineWidth = 1;
  rockCtx.stroke();

  // Rock texture (large)
  const rockLargeCanvas = document.createElement('canvas');
  rockLargeCanvas.width = 16;
  rockLargeCanvas.height = 16;
  const rockLargeCtx = rockLargeCanvas.getContext('2d')!;
  rockLargeCtx.fillStyle = '#3a3a3a';
  rockLargeCtx.beginPath();
  rockLargeCtx.moveTo(8, 0);
  rockLargeCtx.lineTo(15, 4);
  rockLargeCtx.lineTo(14, 12);
  rockLargeCtx.lineTo(8, 16);
  rockLargeCtx.lineTo(2, 13);
  rockLargeCtx.lineTo(0, 6);
  rockLargeCtx.closePath();
  rockLargeCtx.fill();
  rockLargeCtx.strokeStyle = '#555';
  rockLargeCtx.lineWidth = 1;
  rockLargeCtx.stroke();
  // Add highlight
  rockLargeCtx.fillStyle = '#5a5a5a';
  rockLargeCtx.fillRect(4, 4, 4, 4);

  return {
    rock: Texture.from(rockCanvas),
    rockLarge: Texture.from(rockLargeCanvas),
  };
};

// --- ATMOSPHERE SYSTEM ---

export class TunnelAtmosphere {
  private debrisLayer: Container;
  private fogLayer: Container;
  private hazardLayer: Container;

  private debris: FloatingDebris[] = [];
  private fogGraphics: Graphics | null = null;
  private textures: { rock: Texture; rockLarge: Texture; fossil: Texture; tech: Texture } | null = null;

  private activeHazard: HazardEvent | null = null;
  private screenShake = { x: 0, y: 0 };

  private config: AtmosphereConfig = { screenWidth: 800, screenHeight: 600 };

  constructor() {
    this.debrisLayer = new Container();
    this.fogLayer = new Container();
    this.hazardLayer = new Container();
  }

  /**
   * Initialize atmosphere system and add layers to parent container.
   */
  // --- BACKGROUND SYSTEM ---

  private createBackgroundObjects(count: number): void {
    if (!this.textures) return;

    for (let i = 0; i < count; i++) {
      const typeRoll = Math.random();
      let texture = this.textures.rock; // Fallback
      let scaleBase = 1.0;

      if (typeRoll < 0.3) {
        texture = this.textures.fossil;
        scaleBase = 2.0;
      } else if (typeRoll < 0.6) {
        texture = this.textures.tech;
        scaleBase = 1.8;
      } else {
        texture = this.textures.rockLarge;
        scaleBase = 0.8;
      }

      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);

      // Deep background: slower movement, darker, less opaque
      const z = Math.random() * 0.3; // 0.0 to 0.3 (Very far)
      const scale = scaleBase * (0.5 + z);

      sprite.scale.set(scale);
      sprite.alpha = 0.1 + z * 0.2; // Faint
      sprite.tint = 0x555566; // Blueish tint for background
      sprite.rotation = Math.random() * Math.PI * 2;

      const obj: FloatingDebris = {
        sprite,
        x: Math.random() * this.config.screenWidth,
        y: Math.random() * this.config.screenHeight,
        z: z * 0.2, // Very slow movement
        rotationSpeed: (Math.random() - 0.5) * 0.005,
        size: scale
      };

      this.debris.push(obj); // Add to common physics list but render layer needs to be controlled?
      // Actually, let's separate them to handle draw order if needed, but for now common debris list is fine 
      // IF we add them to the correct layer.

      // We want these BEHIND normal debris.
      // Let's add them to fogLayer? Or a new bgLayer?
      // Re-using debris list for invalidation is fine, but parent should be different.
      // Let's create a dedicated list if we want separate behavior, but reuse is cheaper.
      // To keep it simple: Add to debrisLayer with low Z means they are drawn together.
      // Pixi draws in order of children. We should add background objects FIRST.
      this.debrisLayer.addChildAt(sprite, 0);
    }
  }

  // Generate extended textures
  private generateExtendedTextures(): void {
    const { rock, rockLarge } = generateTextures(); // Keep existing

    // Fossil Texture (Ribcage shape)
    const fossilCanvas = document.createElement('canvas');
    fossilCanvas.width = 32;
    fossilCanvas.height = 32;
    const fCtx = fossilCanvas.getContext('2d')!;
    fCtx.strokeStyle = '#888'; // Lighter color
    fCtx.lineWidth = 3; // Thicker lines
    fCtx.beginPath();
    // Spine
    fCtx.moveTo(16, 4);
    fCtx.lineTo(16, 28);
    // Ribs
    for (let i = 0; i < 4; i++) {
      const y = 8 + i * 6;
      fCtx.moveTo(8, y);
      fCtx.quadraticCurveTo(16, y - 2, 24, y);
    }
    fCtx.stroke();

    // Tech Remnant (Greeble plate)
    const techCanvas = document.createElement('canvas');
    techCanvas.width = 24;
    techCanvas.height = 24;
    const tCtx = techCanvas.getContext('2d')!;
    tCtx.fillStyle = '#4a4a55';
    tCtx.fillRect(2, 2, 20, 20);
    tCtx.fillStyle = '#6a6a75';
    tCtx.fillRect(4, 4, 8, 8);
    tCtx.fillStyle = '#2a2a30';
    tCtx.fillRect(14, 14, 6, 6);
    tCtx.strokeStyle = '#667';
    tCtx.lineWidth = 2;
    tCtx.strokeRect(2, 2, 20, 20);

    this.textures = {
      rock,
      rockLarge,
      fossil: Texture.from(fossilCanvas),
      tech: Texture.from(techCanvas)
    };
  }

  init(parent: Container, config: AtmosphereConfig): void {
    this.config = config;
    this.generateExtendedTextures(); // Use new generation

    // [FIX] Set layers as non-interactive to not block game clicks
    this.fogLayer.eventMode = 'none';
    this.debrisLayer.eventMode = 'none';
    this.hazardLayer.eventMode = 'none';

    // Add layers using addChild (they will be at positions 0, 1, 2)
    // Game layers added AFTER this will be on top
    parent.addChild(this.fogLayer);    // Position 0 (back)
    parent.addChild(this.debrisLayer); // Position 1
    parent.addChild(this.hazardLayer); // Position 2

    // 1. Create Background (Fossils, Tech) - 15 items
    this.createBackgroundObjects(15);

    // 2. Create Foreground Debris (30 small, 10 large)
    this.createDebris(30, 'small');
    this.createDebris(10, 'large');

    // Create fog gradient
    this.createFog();
  }

  private createDebris(count: number, size: 'small' | 'large'): void {
    if (!this.textures) return;

    const texture = size === 'small' ? this.textures.rock : this.textures.rockLarge;
    const baseSize = size === 'small' ? 1 : 1.5;

    for (let i = 0; i < count; i++) {
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);

      const z = Math.random() * 0.8 + 0.2; // Parallax depth
      const scale = baseSize * z;
      sprite.scale.set(scale);
      sprite.alpha = 0.3 + z * 0.4;
      sprite.tint = 0x888888;

      const debris: FloatingDebris = {
        sprite,
        x: Math.random() * this.config.screenWidth,
        y: Math.random() * this.config.screenHeight,
        z,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        size: scale,
      };

      sprite.x = debris.x;
      sprite.y = debris.y;

      this.debris.push(debris);
      this.debrisLayer.addChild(sprite);
    }
  }

  private createFog(): void {
    this.fogGraphics = new Graphics();
    this.fogGraphics.alpha = 0; // Start invisible, controlled by depth
    this.fogLayer.addChild(this.fogGraphics);
  }

  private updateFog(depth: number): void {
    if (!this.fogGraphics) return;

    const { screenWidth, screenHeight } = this.config;

    // Fog intensity based on depth (starts at 5000, max at 50000)
    const fogIntensity = Math.min(1, Math.max(0, (depth - 5000) / 45000));

    this.fogGraphics.clear();

    if (fogIntensity > 0.01) {
      // Gradient from bottom
      const gradientHeight = screenHeight * 0.6;

      for (let i = 0; i < 10; i++) {
        const y = screenHeight - gradientHeight + (i * gradientHeight / 10);
        const alpha = (i / 10) * fogIntensity * 0.3;

        // Deep blue/purple fog
        const color = depth > 30000 ? 0x1a0a2e : 0x0a1a2e;

        this.fogGraphics
          .rect(0, y, screenWidth, gradientHeight / 10)
          .fill({ color, alpha });
      }
    }

    this.fogGraphics.alpha = 1;
  }

  /**
   * Trigger a hazard event.
   */
  triggerHazard(type: HazardEvent['type'], intensity: number = 0.5): void {
    this.activeHazard = {
      type,
      intensity: Math.min(1, Math.max(0.1, intensity)),
      duration: type === 'CAVE_IN' ? 60 : 120, // frames
      elapsed: 0,
    };
  }

  private updateHazards(dt: number): void {
    if (!this.activeHazard) return;

    this.activeHazard.elapsed += dt;

    const { type, intensity, duration, elapsed } = this.activeHazard;
    const progress = elapsed / duration;
    const fadeOut = Math.max(0, 1 - progress);

    // --- Screen Shake (CAVE_IN) ---
    if (type === 'CAVE_IN') {
      const shakeIntensity = intensity * 10 * fadeOut;
      this.screenShake.x = (Math.random() - 0.5) * shakeIntensity;
      this.screenShake.y = (Math.random() - 0.5) * shakeIntensity;
    }

    // --- Gas Pocket (green mist overlay) ---
    if (type === 'GAS_POCKET') {
      this.hazardLayer.alpha = intensity * fadeOut * 0.5;

      if (this.hazardLayer.children.length === 0) {
        const gasOverlay = new Graphics();
        gasOverlay
          .rect(0, 0, this.config.screenWidth, this.config.screenHeight)
          .fill({ color: 0x00ff00, alpha: 0.2 });

        const blur = new BlurFilter({ strength: 20 });
        gasOverlay.filters = [blur];
        this.hazardLayer.addChild(gasOverlay);
      }
    }

    // --- Magma Glow (orange glow from bottom) ---
    if (type === 'MAGMA_FLOW') {
      this.hazardLayer.alpha = intensity * fadeOut;

      if (this.hazardLayer.children.length === 0) {
        const magmaGlow = new Graphics();
        const h = this.config.screenHeight;
        const w = this.config.screenWidth;

        // Gradient glow
        for (let i = 0; i < 5; i++) {
          const y = h - (i + 1) * (h * 0.1);
          const alpha = (5 - i) / 5 * 0.3;
          magmaGlow
            .rect(0, y, w, h * 0.1)
            .fill({ color: 0xff4400, alpha });
        }

        this.hazardLayer.addChild(magmaGlow);
      }
    }

    // Clear hazard when done
    if (elapsed >= duration) {
      this.activeHazard = null;
      this.screenShake = { x: 0, y: 0 };
      this.hazardLayer.removeChildren();
      this.hazardLayer.alpha = 1;
    }
  }

  /**
   * Update atmosphere every frame.
   * @param dt Delta time
   * @param depth Current drill depth
   * @param isDrilling Whether the drill is active
   */
  update(dt: number, depth: number, isDrilling: boolean): { shakeX: number; shakeY: number } {
    const speed = isDrilling ? 3 : 0.5;

    // Update floating debris
    this.debris.forEach((d) => {
      // Move upward (parallax effect)
      d.y -= speed * d.z * dt;
      d.sprite.rotation += d.rotationSpeed * dt;

      // Wrap around
      if (d.y < -20) {
        d.y = this.config.screenHeight + 20;
        d.x = Math.random() * this.config.screenWidth;
      }

      d.sprite.x = d.x;
      d.sprite.y = d.y;
    });

    // Update fog based on depth
    this.updateFog(depth);

    // Update hazards
    this.updateHazards(dt);

    return { shakeX: this.screenShake.x, shakeY: this.screenShake.y };
  }

  /**
   * Resize handler.
   */
  resize(width: number, height: number): void {
    this.config.screenWidth = width;
    this.config.screenHeight = height;
  }

  /**
   * Cleanup.
   */
  destroy(): void {
    this.debrisLayer.destroy({ children: true });
    this.fogLayer.destroy({ children: true });
    this.hazardLayer.destroy({ children: true });
    this.debris = [];
  }
}

// Singleton export
export const tunnelAtmosphere = new TunnelAtmosphere();
