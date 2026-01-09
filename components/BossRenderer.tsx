
import React, { useEffect, useRef } from 'react';
import { BossType } from '../types';

interface BossRendererProps {
  bossType: BossType;
  color: string;
  hpPercent: number;
  time: number;
  isHit: boolean;
}

const BossRenderer: React.FC<BossRendererProps> = ({ bossType, color, hpPercent, time, isHit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId = 0;
    let tick = 0;

    const render = () => {
       tick++;
       const w = canvas.width;
       const h = canvas.height;
       const cx = w / 2;
       const cy = h * 0.4;
       
       ctx.clearRect(0, 0, w, h);
       
       if (isHit) {
         ctx.save();
         ctx.translate((Math.random()-0.5)*10, (Math.random()-0.5)*10);
       }

       ctx.strokeStyle = isHit ? '#fff' : color;
       ctx.fillStyle = isHit ? '#fff' : '#000';
       ctx.lineWidth = 3;
       ctx.shadowBlur = 15;
       ctx.shadowColor = color;

       const pulse = Math.sin(tick * 0.05) * 10;

       ctx.beginPath();
       if (bossType === 'WORM') {
          // Draw Segmented Worm
          for(let i=0; i<5; i++) {
             const yOffset = i * 40 + Math.sin(tick * 0.1 + i) * 10;
             const width = 60 - i * 5 + pulse/2;
             ctx.rect(cx - width/2, cy + yOffset, width, 30);
          }
       } 
       else if (bossType === 'CORE') {
          // Draw Spinning Core
          const size = 60 + pulse;
          ctx.arc(cx, cy + 50, size, 0, Math.PI * 2);
          // Orbiting rings
          ctx.moveTo(cx + size + 20, cy + 50);
          ctx.ellipse(cx, cy + 50, size + 30, 20, tick * 0.05, 0, Math.PI * 2);
       }
       else if (bossType === 'CONSTRUCT') {
          // Rotating Square
          ctx.save();
          ctx.translate(cx, cy + 50);
          ctx.rotate(tick * 0.02);
          const size = 80;
          ctx.rect(-size/2, -size/2, size, size);
          ctx.rotate(tick * 0.02); // Double rotation
          ctx.rect(-size/3, -size/3, size/1.5, size/1.5);
          ctx.restore();
       } 
       else { // SWARM
          // Cluster of dots
          for(let i=0; i<8; i++) {
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
          ctx.fillStyle = 'red';
          ctx.fill();
       } else {
          ctx.fill();
       }

       if (isHit) ctx.restore();

       frameId = requestAnimationFrame(render);
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
  }, [bossType, color, hpPercent, isHit]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default BossRenderer;
