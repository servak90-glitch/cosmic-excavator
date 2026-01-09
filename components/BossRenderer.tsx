
import React, { useEffect, useRef } from 'react';
import { BossType } from '../types';

interface BossRendererProps {
  bossType: BossType;
  color: string;
  hpPercent: number; // 0 to 1
  time: number; // Game tick or internal timer
  isHit: boolean;
}

const BossRenderer: React.FC<BossRendererProps> = ({ bossType, color, hpPercent, time, isHit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  // Convert hex color to normalized RGB
  const getHexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', { powerPreference: 'high-performance' });
    if (!gl) return;

    const vsSource = `#version 300 es
      in vec4 a_position;
      void main() { gl_Position = a_position; }
    `;

    const fsSource = `#version 300 es
      precision highp float;
      uniform float u_time;
      uniform vec3 u_color;
      uniform float u_type; // 0=WORM, 1=CORE, 2=CONSTRUCT, 3=SWARM
      uniform float u_hp; // 0.0 - 1.0
      uniform float u_hit; // 0.0 or 1.0
      uniform vec2 u_resolution;

      out vec4 outColor;

      float sdSphere(vec3 p, float s) { return length(p) - s; }
      float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
      float sdOctahedron(vec3 p, float s) { p = abs(p); return (p.x+p.y+p.z-s)*0.57735027; }
      
      mat2 rot(float a) { float s=sin(a), c=cos(a); return mat2(c, -s, s, c); }
      
      float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
      }

      float map(vec3 p) {
        float d = 1000.0;
        float pulse = sin(u_time * (2.0 + (1.0 - u_hp) * 5.0)) * 0.05;
        
        // ORIENTATION FIX:
        // We rotate the world so Z+ is "UP" relative to the camera look direction?
        // No, let's keep it simple. We want the boss to look like it's rising.
        // For WORM: Align body with Y axis, move texture downwards.
        
        if (u_type < 0.5) { 
          // WORM: Vertical alignment (Y-axis)
          vec3 q = p;
          // Curve slightly
          q.x += sin(q.y * 0.5 + u_time) * 0.5;
          q.z += cos(q.y * 0.5 + u_time * 0.8) * 0.5;
          
          float segment = sdSphere(q, 0.7 + pulse);
          
          // Move "segments" downwards along Y to simulate rising
          vec3 qSeg = q;
          qSeg.y = mod(qSeg.y + u_time * 2.0, 1.2) - 0.6;
          float spikes = sdOctahedron(qSeg, 0.6);
          
          d = smin(segment, spikes, 0.2);
          // Limit height (make it look endless or clipped)
          d = max(d, abs(p.y) - 4.5);
        } 
        else if (u_type < 1.5) {
          // CORE: Floating sphere, rising feeling
          vec3 q = p;
          q.y += sin(u_time) * 0.2; // Bobbing
          float sphere = sdSphere(q, 0.9 + pulse * 2.0);
          
          // Rings rotating
          vec3 r1 = q; r1.xz *= rot(u_time); r1.xy *= rot(u_time * 0.5);
          float ring1 = max(abs(length(r1.xz) - 1.3) - 0.1, abs(r1.y) - 0.05);
          
          vec3 r2 = q; r2.yz *= rot(-u_time * 0.8);
          float ring2 = max(abs(length(r2.yz) - 1.5) - 0.1, abs(r2.x) - 0.05);
          
          d = smin(sphere, min(ring1, ring2), 0.5);
        }
        else if (u_type < 2.5) {
          // CONSTRUCT: Geometric
          vec3 q = p;
          q.xy *= rot(u_time * 0.2);
          q.xz *= rot(u_time * 0.1);
          d = sdBox(q, vec3(0.6));
          for(int i=0; i<3; i++) {
             q = abs(q) - vec3(0.3);
             q.xy *= rot(1.0);
             q.xz *= rot(1.0);
             d = smin(d, sdBox(q, vec3(0.2)), 0.1);
          }
        }
        else {
          // SWARM
          vec3 q = p;
          q.y += u_time; // Particles falling/rising relative
          q = mod(q + 0.5, 1.0) - 0.5;
          float particles = sdSphere(q, 0.1 + pulse);
          d = max(particles, length(p) - 1.6);
        }
        
        if (u_hit > 0.5 || u_hp < 0.2) {
           d += sin(p.y * 20.0 + u_time * 20.0) * 0.02;
        }
        return d;
      }

      vec3 calcNormal(vec3 p) {
        const vec2 e = vec2(0.01, 0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        
        // CAMERA POSITION
        // We look slightly DOWN (pitch) to see the creature "below" us
        vec3 ro = vec3(0.0, 1.5, -3.5); // Moved camera up
        vec3 target = vec3(0.0, -0.5, 0.0); // Looking slightly down
        
        vec3 fwd = normalize(target - ro);
        vec3 right = normalize(cross(fwd, vec3(0,1,0)));
        vec3 up = cross(right, fwd);
        
        vec3 rd = normalize(fwd * 1.5 + right * uv.x + up * uv.y);

        float t = 0.0;
        float d = 0.0;
        int steps = 0;
        // OPTIMIZATION: Reduced steps 64 -> 40
        for(int i=0; i<40; i++) {
          vec3 p = ro + rd * t;
          d = map(p);
          if (d < 0.01 || t > 10.0) break;
          t += d;
          steps = i;
        }

        vec3 col = vec3(0.0);
        if (t < 10.0) {
           vec3 p = ro + rd * t;
           vec3 n = calcNormal(p);
           vec3 lightDir = normalize(vec3(0.0, 1.0, -0.5)); // Light from top
           
           float diff = max(dot(n, lightDir), 0.0);
           float rim = 1.0 - max(dot(n, -rd), 0.0);
           rim = pow(rim, 3.0);
           
           col = u_color * (diff * 0.5 + 0.2);
           col += u_color * rim * 2.0;
           
           if (u_hp < 0.3) {
              col += vec3(0.5, 0.0, 0.0) * sin(u_time * 10.0);
           }
           if (u_hit > 0.5) col = vec3(1.0);
        }
        
        col += u_color * 0.05 * float(steps)/5.0; // Fog glow
        outColor = vec4(col, 1.0);
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
      color: gl.getUniformLocation(program, 'u_color'),
      type: gl.getUniformLocation(program, 'u_type'),
      hp: gl.getUniformLocation(program, 'u_hp'),
      hit: gl.getUniformLocation(program, 'u_hit'),
      res: gl.getUniformLocation(program, 'u_resolution'),
    };

    const getTypeFloat = (t: BossType) => {
      if (t === 'WORM') return 0.0;
      if (t === 'CORE') return 1.0;
      if (t === 'CONSTRUCT') return 2.0;
      return 3.0; // SWARM
    };

    const render = () => {
       const now = (Date.now() - startTimeRef.current) * 0.001;
       gl.viewport(0, 0, canvas.width, canvas.height);
       gl.useProgram(program);
       
       const rgb = getHexToRgb(color);
       gl.uniform1f(locs.time, now);
       gl.uniform3f(locs.color, rgb[0], rgb[1], rgb[2]);
       gl.uniform1f(locs.type, getTypeFloat(bossType));
       gl.uniform1f(locs.hp, hpPercent);
       gl.uniform1f(locs.hit, isHit ? 1.0 : 0.0);
       gl.uniform2f(locs.res, canvas.width, canvas.height);

       gl.bindVertexArray(vao);
       gl.drawArrays(gl.TRIANGLES, 0, 6);
       animationRef.current = requestAnimationFrame(render);
    };

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();
    render();

    return () => {
       cancelAnimationFrame(animationRef.current);
       window.removeEventListener('resize', resize);
       gl.deleteProgram(program);
    };
  }, [bossType, color, hpPercent, isHit]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default BossRenderer;
