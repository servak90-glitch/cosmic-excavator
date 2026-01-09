
import React, { useEffect, useRef } from 'react';
import { FlyingObject } from '../types';

interface FlyingObjectsRendererProps {
  objects: FlyingObject[];
}

const FlyingObjectsRenderer: React.FC<FlyingObjectsRendererProps> = ({ objects }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', { 
        alpha: true, 
        premultipliedAlpha: false,
        powerPreference: 'high-performance'
    });
    if (!gl) return;

    const vsSource = `#version 300 es
      in vec4 a_position;
      void main() { gl_Position = a_position; }
    `;

    const fsSource = `#version 300 es
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      
      uniform vec2 u_positions[5];
      uniform float u_types[5]; 
      uniform float u_active[5]; 

      out vec4 outColor;

      mat2 rot(float a) { float s=sin(a), c=cos(a); return mat2(c, -s, s, c); }
      
      // SDFs - TINY SIZES FOR HARDER GAMEPLAY
      float sdSphere(vec3 p, float s) { return length(p) - s; }
      float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0); }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        vec3 finalColor = vec3(0.0);
        float alpha = 0.0;
        
        for(int i=0; i<5; i++) {
            if(u_active[i] < 0.5) continue;

            vec2 objPos = u_positions[i];
            vec2 targetUV = vec2(
                (objPos.x * u_resolution.x / u_resolution.y) - (0.5 * u_resolution.x / u_resolution.y),
                -(objPos.y - 0.5) 
            );

            // Tighter bounding box for raymarching optimization
            vec2 dist = abs(uv - targetUV);
            if (dist.x > 0.08 || dist.y > 0.08) continue;

            vec2 p = uv - targetUV;
            float type = u_types[i];
            
            vec3 col = vec3(0.0);
            float d = 1.0;
            float glow = 0.0;

            vec3 ro = vec3(0.0, 0.0, -2.0);
            vec3 rd = normalize(vec3(p, 1.0));
            float t = 0.0;
            
            // --- GEODE SMALL (RUBY/EMERALD) ---
            if (type < 0.5) {
                // Use SPHERE for consistent size during rotation
                // Radius: 0.03 (Very small)
                vec3 p3 = ro + rd * t;
                for(int k=0; k<5; k++) {
                    vec3 q = p3;
                    float h = sdSphere(q, 0.03); 
                    t += h;
                    p3 = ro + rd * t;
                    if(h < 0.001) break; 
                }
                d = length(p) - 0.015; // Glow distance
                
                float hue = sin(u_time + float(i)*10.0);
                vec3 gemCol = hue > 0.0 ? vec3(1.0, 0.0, 0.3) : vec3(0.0, 1.0, 0.5);
                
                if (t < 5.0) col += gemCol * 3.0; 
                
                // Reduced glow intensity
                glow = 0.0015 / abs(d); 
                col += gemCol * glow;
            }
            // --- GEODE LARGE (DIAMOND) ---
            else if (type < 1.5) {
                vec3 p3 = ro + rd * t;
                for(int k=0; k<6; k++) {
                    vec3 q = p3;
                    q.xy *= rot(u_time * 2.0);
                    // A slightly larger, spinning cube
                    float h = sdBox(q, vec3(0.025)); 
                    t += h;
                    p3 = ro + rd * t;
                    if(h < 0.001) break;
                }
                d = length(p) - 0.02;
                
                vec3 goldCol = vec3(0.8, 0.9, 1.0); // Diamond white/blue
                if (t < 5.0) col += goldCol * 4.0;
                
                glow = 0.002 / abs(d);
                col += goldCol * glow;
                col += vec3(0.0, 0.5, 1.0) * glow * 0.2; 
            }
            // --- SATELLITE (TECH) ---
            else {
                vec3 p3 = ro + rd * t;
                for(int k=0; k<6; k++) {
                    vec3 q = p3;
                    q.xz *= rot(u_time);
                    // Tiny rectangular debris
                    float h = sdBox(q, vec3(0.04, 0.015, 0.01));
                    t += h;
                    p3 = ro + rd * t;
                    if(h < 0.001) break;
                }
                d = length(p) - 0.02;
                
                vec3 techCol = vec3(0.2, 0.8, 1.0);
                if (t < 5.0) col += techCol * 2.0;
                
                glow = 0.0015 / abs(d);
                col += techCol * glow;
            }

            finalColor += col;
            alpha += glow;
            if(t < 5.0) alpha += 1.0;
        }

        outColor = vec4(finalColor, min(1.0, alpha));
      }
    `;

    function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const locs = {
      time: gl.getUniformLocation(program, 'u_time'),
      res: gl.getUniformLocation(program, 'u_resolution'),
      pos: gl.getUniformLocation(program, 'u_positions'),
      types: gl.getUniformLocation(program, 'u_types'),
      active: gl.getUniformLocation(program, 'u_active')
    };

    const render = () => {
       const now = (Date.now() - startTimeRef.current) * 0.001;
       gl.clearColor(0, 0, 0, 0);
       gl.clear(gl.COLOR_BUFFER_BIT);
       gl.viewport(0, 0, canvas.width, canvas.height);
       gl.useProgram(program);
       gl.uniform1f(locs.time, now);
       gl.uniform2f(locs.res, canvas.width, canvas.height);

       const posArr = new Float32Array(10);
       const typeArr = new Float32Array(5);
       const activeArr = new Float32Array(5);

       objects.forEach((obj, i) => {
           if (i >= 5) return;
           posArr[i*2] = obj.x / 100;
           posArr[i*2+1] = obj.y / 100;
           typeArr[i] = obj.type === 'GEODE_SMALL' ? 0.0 : obj.type === 'GEODE_LARGE' ? 1.0 : 2.0;
           activeArr[i] = 1.0;
       });

       gl.uniform2fv(locs.pos, posArr);
       gl.uniform1fv(locs.types, typeArr);
       gl.uniform1fv(locs.active, activeArr);

       gl.bindVertexArray(vao);
       gl.drawArrays(gl.TRIANGLES, 0, 6);
       requestAnimationFrame(render);
    };

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
    render();

    return () => {
        window.removeEventListener('resize', resize);
        gl.deleteProgram(program);
    };
  }, [objects]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20" />;
};

export default FlyingObjectsRenderer;
