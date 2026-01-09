
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface ParticleHandle {
  emit: (x: number, y: number, color: string, type: 'DEBRIS' | 'SPARK' | 'SMOKE', count: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'DEBRIS' | 'SPARK' | 'SMOKE';
}

const ParticleRenderer = forwardRef<ParticleHandle, {}>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);

  useImperativeHandle(ref, () => ({
    emit: (x, y, color, type, count) => {
      for (let i = 0; i < count; i++) {
        let vx = 0, vy = 0, life = 1, size = 2;
        
        if (type === 'DEBRIS') {
          // Fountain effect
          const angle = (Math.random() - 0.5) * Math.PI; 
          const speed = Math.random() * 4 + 2;
          vx = Math.sin(angle) * speed;
          vy = -Math.abs(Math.cos(angle) * speed) - 2; // Upwards initially
          life = 40 + Math.random() * 30;
          size = 2 + Math.random() * 4;
        } else if (type === 'SPARK') {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6 + 2; 
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
          life = 15 + Math.random() * 10;
          size = 1 + Math.random();
          color = '#fff'; 
        } else if (type === 'SMOKE') {
          vx = (Math.random() - 0.5) * 1;
          vy = -2 - Math.random() * 2; // Float up
          life = 50 + Math.random() * 30;
          size = 5 + Math.random() * 10;
        }

        particles.current.push({
          x, y, vx, vy, life, maxLife: life, color, size, type
        });
      }
      
      if (particles.current.length > 300) {
         particles.current.splice(0, particles.current.length - 300);
      }
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let frameId = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Additive blending makes everything look "hot" and glowing
      ctx.globalCompositeOperation = 'lighter';

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        
        if (p.type === 'DEBRIS') {
            p.vy += 0.2; // Gravity
            p.vx *= 0.95; // Drag
        }
        
        if (p.life <= 0) {
          particles.current.splice(i, 1);
          continue;
        }

        const opacity = p.life / p.maxLife;
        ctx.globalAlpha = opacity;
        ctx.fillStyle = p.color;
        
        if (p.type === 'SPARK') {
           // Long tracers
           ctx.beginPath();
           ctx.moveTo(p.x, p.y);
           ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2); 
           ctx.strokeStyle = `rgba(255, 255, 200, ${opacity})`;
           ctx.lineWidth = 1;
           ctx.stroke();
        } else if (p.type === 'SMOKE') {
           // Pixelated smoke cloud
           const s = p.size;
           ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
        } else {
           // Debris: Square bits (Pixel art debris)
           const s = p.size;
           ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
        }
      }
      
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over'; 
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
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-30" />;
});

export default ParticleRenderer;
