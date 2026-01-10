
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
           // Offset radius so they don't overlap
           let radius = 70 + i * 25; 
           // Different speeds for visual variety
           let speed = 0.04 + (i % 3) * 0.01;
           
           // Visual config
           if (type === 'COLLECTOR') color = '#00FF00'; // Green
           else if (type === 'COOLER') color = '#00FFFF'; // Cyan
           else if (type === 'BATTLE') { color = '#FF0000'; speed *= 2; } // Red, Fast
           else if (type === 'REPAIR') { color = '#FFD700'; speed *= 0.5; } // Gold, Slow
           else if (type === 'MINER') color = '#FF00FF'; // Magenta

           const angle = tick * speed;
           // Elliptical orbit
           const x = cx + Math.cos(angle) * radius;
           const y = cy + Math.sin(angle) * (radius * 0.3);

           // Draw Drone Shape
           ctx.shadowColor = color;
           ctx.shadowBlur = 10;
           ctx.fillStyle = color;
           ctx.strokeStyle = color;
           ctx.lineWidth = 2;

           ctx.beginPath();
           if (type === 'COLLECTOR') {
               // Circle
               ctx.arc(x, y, 4, 0, Math.PI * 2);
               ctx.fill();
           } else if (type === 'COOLER') {
               // Square
               ctx.fillRect(x - 3, y - 3, 6, 6);
           } else if (type === 'BATTLE') {
               // Triangle
               ctx.moveTo(x, y - 5);
               ctx.lineTo(x + 4, y + 3);
               ctx.lineTo(x - 4, y + 3);
               ctx.closePath();
               ctx.fill();
           } else if (type === 'REPAIR') {
               // Cross
               ctx.fillRect(x - 4, y - 1.5, 8, 3);
               ctx.fillRect(x - 1.5, y - 4, 3, 8);
           } else if (type === 'MINER') {
               // Diamond
               ctx.moveTo(x, y - 5);
               ctx.lineTo(x + 4, y);
               ctx.lineTo(x, y + 5);
               ctx.lineTo(x - 4, y);
               ctx.closePath();
               ctx.stroke(); // Wireframe diamond
           }
           
           // Trail
           ctx.beginPath();
           ctx.strokeStyle = color;
           ctx.lineWidth = 1;
           ctx.globalAlpha = 0.2;
           ctx.arc(cx, cy, radius, 0, Math.PI * 2); 
           ctx.stroke();
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
