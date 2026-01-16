
import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { BossType } from '../types'; // [DEV_CONTEXT: HARDENING]

interface BossRendererProps {
   isHit: boolean;
   visualEffect: string; // VisualEffectType
}

const BossRenderer: React.FC<BossRendererProps> = React.memo(({ isHit, visualEffect }) => {
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let frameId = 0;
      let tick = 0;

      const render = () => {
         frameId = requestAnimationFrame(render);
         tick++;

         // [DEV_CONTEXT: DIRECT ACCESS]
         const state = useGameStore.getState();
         const boss = state.currentBoss;

         if (!boss) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
         }

         const hpPercent = boss.currentHp / boss.maxHp;
         const baseColor = boss.color;
         const bossType = boss.type;

         // Phase Logic (Visuals)
         let phaseColor = baseColor;
         let pulseSpeed = 0.05;
         let shake = 0;

         if (hpPercent < 0.2) {
            phaseColor = '#ff0000'; // Enraged
            pulseSpeed = 0.2;
            shake = 5;
         } else if (hpPercent < 0.5) {
            phaseColor = '#ff8800'; // Aggressive
            pulseSpeed = 0.1;
            shake = 2;
         }

         const w = canvas.width;
         const h = canvas.height;
         let cx = w / 2;
         let cy = h * 0.4;

         ctx.clearRect(0, 0, w, h);

         // Shake Effect
         if (shake > 0 || isHit || visualEffect !== 'NONE') {
            const intensity = (isHit ? 10 : 0) + shake + (visualEffect === 'EMP_SHOCK' ? 10 : 0);
            cx += (Math.random() - 0.5) * intensity;
            cy += (Math.random() - 0.5) * intensity;
         }

         const pulse = Math.sin(tick * pulseSpeed) * 10;

         ctx.strokeStyle = isHit ? '#fff' : phaseColor;
         ctx.fillStyle = isHit ? '#fff' : '#000';
         ctx.lineWidth = 3;
         ctx.shadowBlur = 15;
         ctx.shadowColor = phaseColor;

         // INVULNERABILITY SHIELD
         if (boss.isInvulnerable) {
            ctx.save();
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00ffff';
            ctx.globalAlpha = 0.5 + Math.sin(tick * 0.1) * 0.2;
            ctx.beginPath();
            ctx.arc(cx, cy + 50, 100 + pulse / 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(0, 255, 255, 0.05)';
            ctx.fill();
            ctx.restore();
         }

         // WEAK POINTS VISUALS
         if (boss.weakPoints) {
            boss.weakPoints.forEach(wp => {
               if (!wp.isActive) return;
               const wx = cx + wp.x * 2.5; // Match Overlay scaling
               const wy = cy + 50 + wp.y * 2.5; // Match Overlay scaling (+50 offset due to boss centering)

               ctx.save();
               ctx.shadowBlur = 10;
               ctx.shadowColor = '#ff0000';
               ctx.fillStyle = `rgba(255, 0, 0, ${0.4 + Math.sin(tick * 0.2) * 0.3})`;
               ctx.beginPath();
               ctx.arc(wx, wy, wp.radius, 0, Math.PI * 2);
               ctx.fill();

               ctx.strokeStyle = '#ffaaaa';
               ctx.lineWidth = 1;
               ctx.beginPath();
               ctx.arc(wx, wy, wp.radius * (0.8 + Math.sin(tick * 0.1) * 0.2), 0, Math.PI * 2);
               ctx.stroke();
               ctx.restore();
            });
         }

         ctx.beginPath();

         // ... Boss Shapes (Existing logic) ...
         if (bossType === BossType.WORM) {
            for (let i = 0; i < 5; i++) {
               const yOffset = i * 40 + Math.sin(tick * 0.1 + i) * 10;
               const width = 60 - i * 5 + pulse / 2;
               ctx.rect(cx - width / 2, cy + yOffset, width, 30);
            }
         }
         else if (bossType === BossType.CORE) {
            const size = 60 + pulse;
            ctx.arc(cx, cy + 50, size, 0, Math.PI * 2);
            ctx.moveTo(cx + size + 20, cy + 50);
            ctx.ellipse(cx, cy + 50, size + 30, 20, tick * 0.05, 0, Math.PI * 2);
         }
         else if (bossType === BossType.CONSTRUCT) {
            ctx.save();
            ctx.translate(cx, cy + 50);
            ctx.rotate(tick * 0.02);
            const size = 80;
            ctx.rect(-size / 2, -size / 2, size, size);
            ctx.rotate(tick * 0.02);
            ctx.rect(-size / 3, -size / 3, size / 1.5, size / 1.5);
            ctx.restore();
         }
         else {
            for (let i = 0; i < 8; i++) {
               const angle = (Math.PI * 2 / 8) * i + tick * 0.05;
               const r = 60 + Math.sin(tick * 0.1) * 20;
               const x = cx + Math.cos(angle) * r;
               const y = cy + 50 + Math.sin(angle) * r;
               ctx.moveTo(x + 10, y);
               ctx.arc(x, y, 10, 0, Math.PI * 2);
            }
         }

         ctx.stroke();
         if (hpPercent < 0.3 && tick % 10 < 5) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fill();
         } else {
            ctx.fill();
         }

         // EFFECTS OVERLAY
         if (visualEffect === 'EMP_SHOCK') {
            ctx.save();
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.7;
            for (let i = 0; i < 5; i++) {
               ctx.beginPath();
               ctx.moveTo(cx + (Math.random() - 0.5) * 100, cy + (Math.random() - 0.5) * 100);
               ctx.lineTo(cx + (Math.random() - 0.5) * 100, cy + (Math.random() - 0.5) * 100);
               ctx.stroke();
            }
            ctx.restore();
         }

         if (visualEffect === 'FIRE_BURST') {
            ctx.save();
            ctx.fillStyle = '#ff4400';
            ctx.globalAlpha = 0.6;
            for (let i = 0; i < 10; i++) {
               const angle = Math.random() * Math.PI * 2;
               const r = 50 + Math.random() * 80;
               const px = cx + Math.cos(angle) * r;
               const py = cy + 50 + Math.sin(angle) * r;
               ctx.beginPath();
               ctx.arc(px, py, 5 + Math.random() * 10, 0, Math.PI * 2);
               ctx.fill();
            }
            ctx.restore();
         }

         if (visualEffect === 'GLITCH_RED') {
            ctx.save();
            ctx.fillStyle = '#ff0000';
            ctx.globalCompositeOperation = 'difference';
            if (tick % 4 === 0) {
               ctx.fillRect(cx - 100, cy, 200, 20);
            }
            ctx.restore();
         }

         if (isHit) ctx.restore();
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
         cancelAnimationFrame(frameId);
      };
   }, [isHit]); // Only re-run effect if isHit changes, though RAF handles the loop

   return <canvas ref={canvasRef} className="w-full h-full block" />;
});

export default BossRenderer;
