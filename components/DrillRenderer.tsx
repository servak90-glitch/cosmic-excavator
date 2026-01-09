
import React, { useEffect, useRef } from 'react';
import { VisualEffectType, DrillFX } from '../types';

interface DrillRendererProps {
  heat: number;
  evolution: number;
  spinning: boolean;
  biomeColor: string;
  depth: number;
  activeVisualEffects: VisualEffectType[]; 
  activeDrillFX?: DrillFX; 
}

const DrillRenderer: React.FC<DrillRendererProps> = ({ heat, evolution, spinning, biomeColor, depth, activeVisualEffects }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Parallax stars/debris data
  const debrisRef = useRef<{x: number, y: number, z: number, size: number, shape: number}[]>([]);

  useEffect(() => {
    // Init debris
    if (debrisRef.current.length === 0) {
        for(let i=0; i<30; i++) {
            debrisRef.current.push({
                x: (Math.random() - 0.5) * 800,
                y: Math.random() * 1000,
                z: Math.random() * 2 + 0.5,
                size: Math.random() * 3 + 1,
                shape: Math.floor(Math.random() * 3)
            });
        }
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    // --- DRAWING HELPERS ---

    const drawTrapezoid = (x: number, y: number, wTop: number, wBot: number, h: number, fill: string | CanvasGradient) => {
        ctx.beginPath();
        ctx.moveTo(x - wTop/2, y);
        ctx.lineTo(x + wTop/2, y);
        ctx.lineTo(x + wBot/2, y + h);
        ctx.lineTo(x - wBot/2, y + h);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.stroke();
    };

    const drawCoil = (x: number, y: number, w: number, h: number, color: string, active: boolean) => {
        // Background
        ctx.fillStyle = '#111';
        ctx.fillRect(x, y, w, h);
        
        // Coils
        const coils = 6;
        const coilH = h / coils;
        for(let i=0; i<coils; i++) {
            const cy = y + i * coilH;
            ctx.fillStyle = active ? color : '#333';
            if (active) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 10;
            }
            ctx.fillRect(x + 2, cy + 2, w - 4, coilH - 4);
            ctx.shadowBlur = 0;
            
            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(x + 4, cy + 4, 2, coilH - 8);
        }
    };

    const drawPipes = (x: number, y: number, w: number, h: number, count: number) => {
        const pipeW = w / count;
        for(let i=0; i<count; i++) {
            const px = x + i * pipeW;
            const grad = ctx.createLinearGradient(px, y, px + pipeW, y);
            grad.addColorStop(0, '#222');
            grad.addColorStop(0.5, '#666');
            grad.addColorStop(1, '#222');
            ctx.fillStyle = grad;
            ctx.fillRect(px, y, pipeW - 2, h);
        }
    };

    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h * 0.4;

      ctx.clearRect(0, 0, w, h);

      // --- 1. BACKGROUND TUNNEL ---
      const speed = spinning ? (heat >= 100 ? 0 : 25) : 0;
      
      ctx.save();
      ctx.translate(cx, cy);
      
      // Biome Aura
      const aura = ctx.createRadialGradient(0, 0, 100, 0, 0, h);
      aura.addColorStop(0, 'rgba(0,0,0,0)');
      aura.addColorStop(1, `${biomeColor}33`);
      ctx.fillStyle = aura;
      ctx.fillRect(-w/2, -cy, w, h);

      // Speed lines / Grid
      ctx.strokeStyle = biomeColor;
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 1;
      
      const gridOffset = (tick * speed) % 80;
      
      // Vertical Perspective
      for(let i = -5; i <= 5; i++) {
          ctx.beginPath();
          ctx.moveTo(i * 100, -cy);
          ctx.lineTo(i * 150 * (2 + depth/10000), h);
          ctx.stroke();
      }
      // Horizontal Moving
      for(let y = -200; y < h; y += 80) {
          const dy = y + gridOffset;
          if (dy > h) continue;
          ctx.beginPath();
          ctx.moveTo(-w, dy);
          ctx.lineTo(w, dy);
          ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // Debris
      debrisRef.current.forEach(d => {
          d.y -= speed * d.z * 0.1;
          if (d.y < -cy - 100) {
              d.y = h;
              d.x = (Math.random() - 0.5) * w;
          }
          const scale = Math.max(0.1, (d.y + cy) / h);
          ctx.fillStyle = biomeColor;
          ctx.globalAlpha = scale;
          const sz = d.size * scale * 2;
          ctx.fillRect(d.x * scale, d.y, sz, sz * (speed > 0 ? 5 : 1));
      });
      ctx.globalAlpha = 1.0;
      ctx.restore();


      // --- 2. DRILL RENDER (Based on Image & Tier) ---
      
      let shakeX = 0;
      let shakeY = 0;
      if (spinning) {
         const intensity = heat > 80 ? 4 : 2;
         shakeX = (Math.random() - 0.5) * intensity;
         shakeY = (Math.random() - 0.5) * intensity;
      }

      ctx.save();
      ctx.translate(cx + shakeX, cy + shakeY);

      // --- CONFIGURATION BASED ON EVOLUTION ---
      // Tiers: 1-3 (Industrial), 4-6 (Refined), 7-9 (Cyber), 10+ (Void)
      const tier = Math.floor((evolution - 1) / 3); // 0, 1, 2, 3...
      
      let primaryColor = '#71717a'; // Zinc-500
      let secondaryColor = '#3f3f46'; // Zinc-700
      let highlightColor = '#d4d4d8'; // Zinc-300
      let glowColor = '#f59e0b'; // Amber
      let cageColor = '#52525b'; // Zinc-600
      
      if (tier === 1) { // Refined
          primaryColor = '#475569'; // Slate
          secondaryColor = '#1e293b';
          highlightColor = '#94a3b8';
          glowColor = '#06b6d4'; // Cyan
          cageColor = '#334155';
      } else if (tier === 2) { // Cyber
          primaryColor = '#18181b'; // Black
          secondaryColor = '#27272a';
          highlightColor = '#a855f7'; // Purple
          glowColor = '#d946ef'; // Magenta
          cageColor = '#a855f7';
      } else if (tier >= 3) { // Void
          primaryColor = '#fff';
          secondaryColor = '#eee';
          highlightColor = '#fff';
          glowColor = '#fff';
          cageColor = '#fff';
      }

      const heatRatio = Math.min(1, heat / 100);

      // -- A. DRILL BIT (Bottom) --
      const bitLength = 120 + evolution * 5;
      const bitWidthTop = 60 + evolution * 2;
      const spinPhase = spinning ? (tick * 0.5) : 0;

      // Bit Gradient
      const bitGrad = ctx.createLinearGradient(-bitWidthTop/2, 0, bitWidthTop/2, 0);
      bitGrad.addColorStop(0, '#000');
      bitGrad.addColorStop(0.2, tier >= 2 ? '#333' : '#555');
      bitGrad.addColorStop(0.5, tier >= 3 ? '#fff' : (tier === 2 ? '#444' : '#888')); // Shine
      bitGrad.addColorStop(0.8, tier >= 2 ? '#333' : '#555');
      bitGrad.addColorStop(1, '#000');

      ctx.beginPath();
      // Draw cone
      const segments = 12;
      const segmentH = bitLength / segments;
      
      // Outline of the bit
      ctx.moveTo(-bitWidthTop/2, 0);
      ctx.lineTo(bitWidthTop/2, 0);
      ctx.lineTo(0, bitLength);
      ctx.closePath();
      ctx.fillStyle = bitGrad;
      ctx.fill();

      // Spiral Threads
      ctx.save();
      ctx.clip(); // Clip to cone
      
      ctx.strokeStyle = tier >= 2 ? glowColor : 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 2;
      if (tier >= 2) ctx.shadowBlur = 5; ctx.shadowColor = glowColor;

      for(let i=0; i<segments * 2; i++) {
          const yBase = i * 15 - (spinPhase % 30);
          
          ctx.beginPath();
          // Calculate curve for spiral
          // Simple slanted lines for "screw" effect
          const y1 = yBase;
          const y2 = yBase + 20;
          
          // Perspective width adjustment
          const w1 = bitWidthTop * (1 - (y1/bitLength));
          const w2 = bitWidthTop * (1 - (y2/bitLength));
          
          if (y1 < bitLength && y2 > 0) {
            ctx.moveTo(-w1/2, y1);
            ctx.lineTo(w2/2, y2);
          }
          ctx.stroke();
      }
      ctx.restore();

      // Heat Glow (Tip)
      if (heat > 0) {
          ctx.globalCompositeOperation = 'lighter';
          const heatG = ctx.createRadialGradient(0, bitLength - 20, 5, 0, bitLength - 40, 60);
          heatG.addColorStop(0, '#fff');
          heatG.addColorStop(0.5, 'rgba(255, 100, 0, 0.8)');
          heatG.addColorStop(1, 'transparent');
          ctx.fillStyle = heatG;
          ctx.beginPath();
          ctx.moveTo(-bitWidthTop/2, 0);
          ctx.lineTo(bitWidthTop/2, 0);
          ctx.lineTo(0, bitLength);
          ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
      }

      // -- B. CHASSIS / HULL (Main Body) --
      const bodyW = 100 + evolution * 2;
      const bodyH = 80;
      const bodyY = -bodyH + 10; // Overlap bit slightly

      // Main Block Gradient
      const bodyGrad = ctx.createLinearGradient(-bodyW/2, bodyY, bodyW/2, bodyY + bodyH);
      bodyGrad.addColorStop(0, primaryColor);
      bodyGrad.addColorStop(1, secondaryColor);

      // Draw Main Box (Chamfered)
      ctx.beginPath();
      ctx.moveTo(-bodyW/2 + 10, bodyY); // Top Left
      ctx.lineTo(bodyW/2 - 10, bodyY);  // Top Right
      ctx.lineTo(bodyW/2, bodyY + 20);  // Shoulder Right
      ctx.lineTo(bodyW/2, bodyY + bodyH); // Bottom Right
      ctx.lineTo(-bodyW/2, bodyY + bodyH); // Bottom Left
      ctx.lineTo(-bodyW/2, bodyY + 20); // Shoulder Left
      ctx.closePath();
      
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      
      // Detail: Rivets / Panel lines
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Side Panels (Rivets)
      ctx.fillStyle = secondaryColor;
      for(let side of [-1, 1]) {
          const px = side * (bodyW/2 - 15);
          const py = bodyY + 30;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI*2);
          ctx.arc(px, py + 20, 3, 0, Math.PI*2);
          ctx.fill();
      }

      // -- C. ENGINE BLOCK (Top Center) --
      const engineW = 50;
      const engineH = 30;
      const engineY = bodyY - engineH + 5;
      
      // Engine Housing
      drawTrapezoid(0, engineY, engineW - 10, engineW, engineH, secondaryColor);
      
      // Radiator Grills / Vents
      ctx.fillStyle = '#111';
      for(let i=0; i<4; i++) {
          const gx = -15 + i * 10;
          ctx.fillRect(gx, engineY + 5, 6, engineH - 10);
      }
      
      // Pipes (Connecting Engine to Core)
      ctx.beginPath();
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 4;
      ctx.moveTo(engineW/2, engineY + 10);
      ctx.quadraticCurveTo(bodyW/2 + 10, engineY, bodyW/2 + 15, bodyY + 20); // To Core
      ctx.stroke();
      
      // Exhaust Pipes (Left side)
      ctx.save();
      ctx.translate(-bodyW/2 + 10, bodyY + 10);
      drawPipes(0, 0, 20, 30, 3);
      if (spinning) {
          // Smoke puffs
           ctx.fillStyle = 'rgba(100,100,100,0.5)';
           if (Math.random() > 0.5) ctx.fillRect(0, -10 - Math.random()*10, 5, 5);
      }
      ctx.restore();

      // -- D. POWER CORE (Right Side) --
      // Attached to the side of the hull
      const coreW = 25;
      const coreH = 50;
      const coreX = bodyW/2;
      const coreY = bodyY + 10;
      
      // Housing
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(coreX, coreY - 5, coreW + 5, coreH + 10);
      
      // Glowing Coils
      drawCoil(coreX + 2, coreY, coreW, coreH, glowColor, spinning || heat > 0);

      // -- E. COCKPIT / SCREEN (Front Center) --
      const screenW = 30;
      const screenH = 20;
      const screenX = -screenW/2;
      const screenY = bodyY + 30;
      
      // Bezel
      ctx.fillStyle = '#222';
      ctx.fillRect(screenX - 2, screenY - 2, screenW + 4, screenH + 4);
      
      // Screen Glow
      const screenActive = spinning;
      ctx.fillStyle = screenActive ? (tier >= 2 ? '#f0f' : '#0f0') : '#112';
      if (screenActive) {
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 5;
      }
      ctx.fillRect(screenX, screenY, screenW, screenH);
      
      // Data lines on screen
      if (screenActive) {
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          const lineY = screenY + (tick % screenH);
          ctx.fillRect(screenX, lineY, screenW, 2);
      }
      ctx.shadowBlur = 0;

      // -- F. ROLL CAGE (Protective Bars) --
      ctx.strokeStyle = cageColor;
      ctx.lineWidth = tier >= 2 ? 2 : 4;
      ctx.lineCap = 'round';
      
      // Left Bar
      ctx.beginPath();
      ctx.moveTo(-bodyW/2 - 5, bodyY + bodyH); // Bottom
      ctx.lineTo(-bodyW/2 - 5, bodyY); // Up
      ctx.lineTo(-engineW/2 - 5, engineY - 5); // To Top
      ctx.stroke();
      
      // Right Bar
      ctx.beginPath();
      ctx.moveTo(bodyW/2 + coreW + 5, bodyY + bodyH);
      ctx.lineTo(bodyW/2 + coreW + 5, bodyY);
      ctx.lineTo(engineW/2 + 5, engineY - 5);
      ctx.stroke();
      
      // Top Crossbar
      ctx.beginPath();
      ctx.moveTo(-engineW/2 - 5, engineY - 5);
      ctx.lineTo(engineW/2 + 5, engineY - 5);
      ctx.stroke();

      // -- G. PARTICLES (Drill Contact) --
      if (spinning) {
          const tipX = 0;
          const tipY = bitLength;
          
          ctx.fillStyle = biomeColor;
          for(let i=0; i<4; i++) {
             const angle = Math.random() * Math.PI;
             const dist = Math.random() * 30;
             const px = tipX + Math.cos(angle) * dist;
             const py = tipY - Math.abs(Math.sin(angle) * 10);
             const s = Math.random() * 3;
             ctx.fillRect(px, py, s, s);
          }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
       if (canvas.parentElement) {
          canvas.width = canvas.parentElement.clientWidth;
          canvas.height = canvas.parentElement.clientHeight;
       }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    render();

    return () => {
       window.removeEventListener('resize', handleResize);
       cancelAnimationFrame(animationFrameId);
    };
  }, [heat, evolution, spinning, biomeColor, activeVisualEffects]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default DrillRenderer;
