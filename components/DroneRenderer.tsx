
import React, { useEffect, useRef } from 'react';
import { DroneType } from '../types';

interface DroneRendererProps {
  activeDrones: DroneType[];
}

const DroneRenderer: React.FC<DroneRendererProps> = ({ activeDrones }) => {
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
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       
       const cx = canvas.width / 2;
       const cy = canvas.height * 0.4; // Match drill center

       activeDrones.forEach((type, i) => {
           let color = '#fff';
           let radius = 60 + i * 20;
           let speed = 0.05 + i * 0.02;
           
           if (type === 'COLLECTOR') color = '#0f0';
           else if (type === 'COOLER') color = '#0ff';
           else color = '#f00';

           const angle = tick * speed;
           // Elliptical orbit
           const x = cx + Math.cos(angle) * radius;
           const y = cy + Math.sin(angle) * (radius * 0.3);

           ctx.fillStyle = color;
           ctx.shadowColor = color;
           ctx.shadowBlur = 5;
           
           ctx.beginPath();
           ctx.arc(x, y, 3, 0, Math.PI * 2);
           ctx.fill();
           
           // Trail
           ctx.beginPath();
           ctx.strokeStyle = color;
           ctx.lineWidth = 1;
           ctx.globalAlpha = 0.3;
           ctx.arc(cx, cy, radius, 0, Math.PI * 2); // Simple orbit ring
           // Flatten ring manually if drawing ellipse path is hard? No, keeping it simple.
           // Actually let's not draw the full ring, looks messy.
           ctx.globalAlpha = 1.0;
       });

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
  }, [activeDrones]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-25" />;
};

export default DroneRenderer;
