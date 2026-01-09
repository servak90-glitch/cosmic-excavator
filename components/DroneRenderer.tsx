
import React, { useEffect, useRef } from 'react';
import { DroneType } from '../types';

interface DroneRendererProps {
  activeDrones: DroneType[];
}

const DroneRenderer: React.FC<DroneRendererProps> = ({ activeDrones }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', { alpha: true, powerPreference: 'low-power' });
    if (!gl) return;

    // Simple shader to draw orbiting dots
    const vsSource = `#version 300 es
      in vec2 a_position; // Quad corners
      
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform int u_droneIndex; // 0, 1, 2
      uniform int u_totalDrones;

      out vec2 v_uv;

      void main() {
         // We draw a full screen quad and calculate orb position in fragment shader?
         // No, simpler: Draw point sprites or translate quad.
         // Let's use full screen quad and math in frag shader for smooth orbit.
         gl_Position = vec4(a_position, 0.0, 1.0);
         v_uv = a_position * 0.5 + 0.5; // 0 to 1
      }
    `;

    const fsSource = `#version 300 es
      precision mediump float;
      
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform int u_activeFlags; // Bitmask: 1=Coll, 2=Cool, 4=Battle

      out vec4 outColor;

      void main() {
         vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
         vec3 col = vec3(0.0);
         
         // Orbit Parameters
         float radius = 0.35; 
         
         // COLLECTOR (Green) - Bit 1
         if ((u_activeFlags & 1) != 0) {
            float angle = u_time * 1.5;
            vec2 pos = vec2(cos(angle), sin(angle)) * radius;
            // Elliptical orbit tilt
            pos.y *= 0.3; 
            
            float d = length(uv - pos);
            if (d < 0.02) col += vec3(0.0, 1.0, 0.0);
            col += vec3(0.0, 1.0, 0.0) * (0.001 / d); // Glow
         }

         // COOLER (Cyan) - Bit 2
         if ((u_activeFlags & 2) != 0) {
            float angle = u_time * 1.0 + 2.09; // Offset
            vec2 pos = vec2(cos(angle), sin(angle)) * (radius + 0.1);
            pos.y *= 0.3;
            
            float d = length(uv - pos);
            if (d < 0.025) col += vec3(0.0, 1.0, 1.0);
            col += vec3(0.0, 1.0, 1.0) * (0.001 / d);
         }

         // BATTLE (Red) - Bit 4
         if ((u_activeFlags & 4) != 0) {
            float angle = u_time * 2.0 + 4.18;
            vec2 pos = vec2(cos(angle), sin(angle)) * (radius - 0.1);
            pos.y *= 0.3;
            
            float d = length(uv - pos);
            if (d < 0.015) col += vec3(1.0, 0.0, 0.0);
            col += vec3(1.0, 0.0, 0.0) * (0.001 / d);
            
            // Laser trail?
            if (d < 0.015) col += vec3(1.0);
         }

         outColor = vec4(col, length(col)); // Additive alpha
      }
    `;

    const createShader = (type: number, src: string) => {
        const s = gl.createShader(type);
        if(!s) return null;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
    };
    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    
    const posLoc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const locs = {
        time: gl.getUniformLocation(prog, 'u_time'),
        res: gl.getUniformLocation(prog, 'u_resolution'),
        active: gl.getUniformLocation(prog, 'u_activeFlags')
    };

    const render = () => {
        const now = (Date.now() - startTimeRef.current) * 0.001;
        
        let flags = 0;
        if (activeDrones.includes('COLLECTOR')) flags |= 1;
        if (activeDrones.includes('COOLER')) flags |= 2;
        if (activeDrones.includes('BATTLE')) flags |= 4;

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0,0,0,0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(prog);
        gl.uniform1f(locs.time, now);
        gl.uniform2f(locs.res, canvas.width, canvas.height);
        gl.uniform1i(locs.active, flags);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    };

    const resize = () => {
        canvas.width = canvas.parentElement?.clientWidth || 300;
        canvas.height = canvas.parentElement?.clientHeight || 300;
    };
    window.addEventListener('resize', resize);
    resize();
    render();

    return () => {
        window.removeEventListener('resize', resize);
        gl.deleteProgram(prog);
    };

  }, [activeDrones]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-25" />;
};

export default DroneRenderer;
