
import React, { useEffect, useRef } from 'react';
import { FlyingObject } from '../types';

interface FlyingObjectsRendererProps {
  objects: FlyingObject[];
}

const FlyingObjectsRenderer: React.FC<FlyingObjectsRendererProps> = ({ objects }) => {
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
       
       ctx.lineWidth = 1.5;

       objects.forEach(obj => {
           const x = (obj.x / 100) * canvas.width;
           const y = (obj.y / 100) * canvas.height;
           
           ctx.save();
           ctx.translate(x, y);
           
           // Rotate the object
           const rot = tick * 0.05;
           
           if (obj.type === 'GEODE_SMALL') {
               // Green Octagon (Wireframe)
               ctx.strokeStyle = '#00ff00';
               ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
               ctx.shadowBlur = 5;
               ctx.shadowColor = '#00ff00';
               
               ctx.beginPath();
               for(let i=0; i<6; i++) {
                   const angle = rot + (i * Math.PI * 2 / 6);
                   const r = 8;
                   const px = Math.cos(angle) * r;
                   const py = Math.sin(angle) * r;
                   if (i===0) ctx.moveTo(px, py);
                   else ctx.lineTo(px, py);
               }
               ctx.closePath();
               ctx.stroke();
               ctx.fill();
               
           } else if (obj.type === 'GEODE_LARGE') {
               // White Diamond (Rotating 3D feel)
               ctx.strokeStyle = '#ffffff';
               ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
               ctx.shadowBlur = 10;
               ctx.shadowColor = '#00ffff';
               
               // Draw a diamond shape that scales width to simulate 3D spin
               const width = Math.sin(rot) * 12;
               const height = 15;
               
               ctx.beginPath();
               ctx.moveTo(0, -height); // Top
               ctx.lineTo(width, 0);   // Right
               ctx.lineTo(0, height);  // Bottom
               ctx.lineTo(-width, 0);  // Left
               ctx.closePath();
               ctx.stroke();
               ctx.fill();

           } else {
               // SATELLITE / CRATE (Cube projection)
               ctx.strokeStyle = '#00ccff';
               ctx.fillStyle = '#00ccff';
               
               const size = 8;
               // Simple isometric cube wireframe
               ctx.beginPath();
               // Front face
               ctx.rect(-size/2, -size/2, size, size);
               ctx.stroke();
               
               // Back lines (simple offset)
               ctx.globalAlpha = 0.5;
               ctx.beginPath();
               ctx.moveTo(-size/2, -size/2); ctx.lineTo(-size/2 + 4, -size/2 - 4);
               ctx.moveTo(size/2, -size/2); ctx.lineTo(size/2 + 4, -size/2 - 4);
               ctx.moveTo(size/2, size/2); ctx.lineTo(size/2 + 4, size/2 - 4);
               ctx.stroke();
               ctx.globalAlpha = 1.0;
               
               // Blinking data light
               if (Math.floor(tick / 10) % 2 === 0) {
                   ctx.fillStyle = '#fff';
                   ctx.fillRect(-2, -2, 4, 4);
               }
           }
           
           ctx.restore();
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
  }, [objects]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20" />;
};

export default FlyingObjectsRenderer;
