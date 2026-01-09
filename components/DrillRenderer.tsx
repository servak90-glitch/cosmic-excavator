
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

const DrillRenderer: React.FC<DrillRendererProps> = ({ heat, evolution, spinning, biomeColor, depth, activeVisualEffects, activeDrillFX }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const heatRef = useRef(heat);
  const evolutionRef = useRef(evolution);
  const spinningRef = useRef(spinning);
  const biomeColorRef = useRef(biomeColor);
  const depthRef = useRef(depth);
  const effectsRef = useRef(activeVisualEffects);
  const fxRef = useRef(activeDrillFX);

  useEffect(() => { heatRef.current = heat; }, [heat]);
  useEffect(() => { evolutionRef.current = evolution; }, [evolution]);
  useEffect(() => { spinningRef.current = spinning; }, [spinning]);
  useEffect(() => { biomeColorRef.current = biomeColor; }, [biomeColor]);
  useEffect(() => { depthRef.current = depth; }, [depth]);
  useEffect(() => { effectsRef.current = activeVisualEffects; }, [activeVisualEffects]);
  useEffect(() => { fxRef.current = activeDrillFX; }, [activeDrillFX]);

  const getHexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', { 
      antialias: false, 
      depth: false, 
      preserveDrawingBuffer: true,
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
      uniform float u_heat;
      uniform float u_evolution;
      uniform float u_spinning;
      uniform float u_depth;
      uniform vec3 u_biomeColor;
      uniform vec2 u_resolution;
      
      uniform float u_glowPurple;
      uniform float u_glowGold;
      uniform float u_glitchRed;
      uniform float u_matrixGreen;
      uniform float u_frostBlue;

      uniform int u_fxMode; 

      out vec4 outColor;

      mat2 rot(float a) { float s=sin(a), c=cos(a); return mat2(c, -s, s, c); }
      float hash(float n) { return fract(sin(n) * 43758.5453123); }

      float dither(vec2 pos, float brightness) {
          int x = int(mod(pos.x, 4.0));
          int y = int(mod(pos.y, 4.0));
          int index = x + y * 4;
          float limit = 0.0;
          if (x < 8) {
             if (index == 0) limit = 0.0625; else if (index == 1) limit = 0.5625;
             else if (index == 2) limit = 0.1875; else if (index == 3) limit = 0.6875;
             else if (index == 4) limit = 0.8125; else if (index == 5) limit = 0.3125;
             else if (index == 6) limit = 0.9375; else if (index == 7) limit = 0.4375;
             else if (index == 8) limit = 0.25;   else if (index == 9) limit = 0.75;
             else if (index == 10) limit = 0.125; else if (index == 11) limit = 0.625;
             else if (index == 12) limit = 1.0;   else if (index == 13) limit = 0.5;
             else if (index == 14) limit = 0.875; else if (index == 15) limit = 0.375;
          }
          return brightness < limit ? 0.0 : 1.0;
      }

      vec3 applyDither(vec3 color, vec2 uv) {
         float grid = 4.0; 
         vec2 ditherUV = gl_FragCoord.xy / grid;
         float levels = 8.0; 
         vec3 c = floor(color * levels) / levels;
         float noise = dither(ditherUV, length(color));
         return mix(c, c * (0.8 + 0.4 * noise), 0.5); 
      }

      float sdBox(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
      }
      float sdCylinder(vec3 p, float h, float r) {
        vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
        return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
      }
      float sdCone(vec3 p, vec2 c, float h) {
        float q = length(p.xz);
        return max(dot(c.xy, vec2(q, p.y)), -h - p.y);
      }

      vec2 map(vec3 p) {
        float isBroken = (u_heat >= 100.0 ? 1.0 : 0.0);
        
        if (u_fxMode == 3) {
           p.x += sin(p.y * 10.0 + u_time * 5.0) * 0.05;
           p.z += cos(p.y * 10.0 + u_time * 5.0) * 0.05;
        }

        float shakeFactor = isBroken * sin(u_time * 180.0) * 0.1;
        if (u_glitchRed > 0.5) shakeFactor += (hash(u_time * 10.0) - 0.5) * 0.05;
        if (u_spinning > 0.5 && isBroken < 0.5) shakeFactor += sin(u_time * 80.0) * 0.015;
        p.x += shakeFactor; p.z += shakeFactor;
        
        float d = 1000.0; float m = 0.0;
        
        float engineBox = sdBox(p - vec3(0, 0.9, 0), vec3(0.65, 0.2, 0.65));
        if(engineBox < d) { d = engineBox; m = 1.0; }
        
        float body = sdCylinder(p - vec3(0, 0.45, 0), 0.25, 0.6);
        if(body < d) { d = body; m = 3.0; }
        
        vec3 qBit = p - vec3(0, -0.1, 0);
        qBit.y = -qBit.y; qBit.y -= 0.45;
        
        float bitSpin = (isBroken > 0.5 ? 0.0 : u_time * (u_spinning > 0.5 ? 45.0 : 6.0));
        qBit.xz *= rot(bitSpin);
        
        if (u_fxMode == 2) {
           qBit.xy *= rot(sin(p.z * 5.0 + u_time) * 0.2);
        }

        float bit = sdCone(qBit, vec2(0.8, 0.6), 1.1);
        float thread = sin(atan(qBit.z, qBit.x) * (3.0 + floor(u_evolution)) + qBit.y * 12.0);
        
        if (u_fxMode == 2) {
           thread = sin(qBit.y * 50.0 + u_time * 10.0) * 0.1; 
        }

        bit -= thread * 0.06 * smoothstep(0.8, -1.2, qBit.y);
        
        if (u_matrixGreen > 0.5) bit += sin(qBit.y * 40.0 + u_time * 10.0) * 0.01;

        if(bit < d) { d = bit; m = 5.0; }
        return vec2(d, m);
      }

      void main() {
        vec2 res = u_resolution.xy;
        float pixelSize = 4.0;
        vec2 pixelCoord = floor(gl_FragCoord.xy / pixelSize) * pixelSize;
        vec2 uv = (pixelCoord - 0.5 * res) / res.y;
        
        if (u_fxMode == 3) {
           float dist = length(uv);
           uv *= 1.0 + sin(u_time + dist * 10.0) * 0.02;
        }

        if (u_glitchRed > 0.5) {
            vec2 pixelRes = vec2(64.0, 64.0);
            uv = floor(uv * pixelRes) / pixelRes;
        }
        
        float travelSpeed = (u_spinning > 0.5 && u_heat < 100.0 ? 10.0 : 0.0);
        float travel = u_depth * 0.01 + u_time * travelSpeed;
        
        vec2 backWallUV = uv - vec2(0.0, travel * 0.5);
        float layerID = floor(backWallUV.y * 4.0);
        vec3 color = mix(u_biomeColor * 0.08, u_biomeColor * 0.22, hash(layerID));
        
        if (u_matrixGreen > 0.5) {
           float rain = fract(uv.y * 10.0 + u_time * 2.0 + hash(uv.x * 20.0));
           if (rain > 0.9) color += vec3(0.0, 0.4, 0.0);
        }

        // --- CAMERA ADJUSTMENT ---
        // Moved camera further back (-5.8 -> -7.0) to make drill look smaller/compact
        vec3 ro = vec3(0, 0.4, -7.0); 
        vec3 rd = normalize(vec3(uv, 1.4)); // FOV
        
        float t = 0.0; vec2 resMap;
        
        for(int i = 0; i < 32; i++) {
          resMap = map(ro + rd * t);
          if(resMap.x < 0.005 || t > 10.0) break;
          t += resMap.x;
        }

        if(t < 10.0) {
          vec3 p = ro + rd * t;
          vec2 e = vec2(0.01, 0);
          vec3 n = normalize(vec3(map(p+e.xyy).x - map(p-e.xyy).x, map(p+e.yxy).x - map(p-e.yxy).x, map(p+e.yyx).x - map(p-e.yyx).x));
          float diff = max(dot(n, normalize(vec3(1, 2, -3))), 0.0);
          
          vec3 mat = vec3(0.45);
          if(resMap.y == 1.0) mat = vec3(0.15, 0.22, 0.4); 
          if(resMap.y == 3.0) mat = vec3(0.3, 0.35, 0.4); 
          if(resMap.y == 5.0) {
             mat = mix(vec3(0.5, 0.6, 0.7), vec3(0.9, 0.95, 1.0), u_evolution/6.0);
             if (u_fxMode == 1) {
                float spec = pow(max(dot(reflect(-normalize(vec3(1, 2, -3)), n), -rd), 0.0), 16.0);
                mat += vec3(0.2, 0.4, 1.0) * spec; 
             }
             if (u_fxMode == 2) {
                mat = vec3(0.0);
                float pulse = sin(p.y * 20.0 - u_time * 5.0);
                mat += (pulse > 0.9) ? vec3(1.0, 0.0, 1.0) : vec3(0.1, 0.0, 0.2);
             }
             if (u_fxMode == 3) {
                mat = vec3(0.0);
                float rim = 1.0 - dot(n, -rd);
                mat += vec3(1.0) * pow(rim, 4.0); 
             }
          } 
          
          vec3 drillColor = mat * (diff + 0.45);
          
          if (u_glowPurple > 0.5) drillColor = mix(drillColor, vec3(0.6, 0.0, 1.0), 0.3 + sin(u_time * 4.0)*0.1);
          if (u_glowGold > 0.5) drillColor = mix(drillColor, vec3(1.0, 0.8, 0.0), 0.4);
          if (u_frostBlue > 0.5) drillColor = mix(drillColor, vec3(0.4, 0.8, 1.0), 0.3);
          if (u_matrixGreen > 0.5) {
             float grid = step(0.9, fract(p.y * 10.0 + u_time));
             drillColor = mix(drillColor, vec3(0.0, 1.0, 0.0), grid * 0.5);
          }

          float heatPerc = u_heat / 100.0;
          if (u_heat >= 100.0) {
            drillColor = vec3(6.0); 
          } else {
            vec3 scarlet = vec3(3.5, 0.2, 0.0);
            vec3 crimson = vec3(1.5, 0.0, 0.0);
            vec3 tint;
            if (heatPerc > 0.8) tint = mix(scarlet, vec3(6.0), smoothstep(0.8, 1.0, heatPerc));
            else if (heatPerc > 0.4) tint = mix(crimson, scarlet, smoothstep(0.4, 0.8, heatPerc));
            else tint = mix(vec3(0.1, 0.6, 1.0) * 0.12, crimson, smoothstep(0.0, 0.4, heatPerc));
            drillColor = mix(drillColor, tint, heatPerc * 0.99);
          }
          
          drillColor *= 0.8 + 0.2 * n.y;
          color = drillColor;
        }

        if (u_glowPurple > 0.5 && t < 10.0) color += vec3(0.4, 0.0, 0.8) * 0.2 * abs(sin(u_time * 2.0));
        if (u_glowGold > 0.5 && t < 10.0) color += vec3(0.8, 0.6, 0.1) * 0.3;
        
        if (u_fxMode == 2 && t < 10.0) color += vec3(0.5, 0.0, 1.0) * 0.1;
        if (u_fxMode == 3) color = vec3(1.0) - color;

        color *= 1.4 - length(uv) * 1.0; 
        color = applyDither(color, uv);

        outColor = vec4(color, 1.0);
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

    const uniforms = {
      time: gl.getUniformLocation(program, 'u_time'),
      heat: gl.getUniformLocation(program, 'u_heat'),
      evo: gl.getUniformLocation(program, 'u_evolution'),
      spin: gl.getUniformLocation(program, 'u_spinning'),
      depth: gl.getUniformLocation(program, 'u_depth'),
      biome: gl.getUniformLocation(program, 'u_biomeColor'),
      res: gl.getUniformLocation(program, 'u_resolution'),
      u_glowPurple: gl.getUniformLocation(program, 'u_glowPurple'),
      u_glowGold: gl.getUniformLocation(program, 'u_glowGold'),
      u_glitchRed: gl.getUniformLocation(program, 'u_glitchRed'),
      u_matrixGreen: gl.getUniformLocation(program, 'u_matrixGreen'),
      u_frostBlue: gl.getUniformLocation(program, 'u_frostBlue'),
      u_fxMode: gl.getUniformLocation(program, 'u_fxMode'),
    };

    let animationFrame: number;
    const handleResize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const render = (time: number) => {
      if (!gl || !program) return;
      const rgb = getHexToRgb(biomeColorRef.current);
      gl.useProgram(program);
      gl.uniform1f(uniforms.time, time * 0.001);
      gl.uniform1f(uniforms.heat, heatRef.current);
      gl.uniform1f(uniforms.evo, evolutionRef.current);
      gl.uniform1f(uniforms.spin, (spinningRef.current && heatRef.current < 100.0) ? 1.0 : 0.0);
      gl.uniform1f(uniforms.depth, depthRef.current);
      gl.uniform3f(uniforms.biome, rgb[0], rgb[1], rgb[2]);
      gl.uniform2f(uniforms.res, canvas.width, canvas.height);
      
      gl.uniform1f(uniforms.u_glowPurple, effectsRef.current.includes('GLOW_PURPLE') ? 1.0 : 0.0);
      gl.uniform1f(uniforms.u_glowGold, effectsRef.current.includes('GLOW_GOLD') ? 1.0 : 0.0);
      gl.uniform1f(uniforms.u_glitchRed, effectsRef.current.includes('GLITCH_RED') ? 1.0 : 0.0);
      gl.uniform1f(uniforms.u_matrixGreen, effectsRef.current.includes('MATRIX_GREEN') ? 1.0 : 0.0);
      gl.uniform1f(uniforms.u_frostBlue, effectsRef.current.includes('FROST_BLUE') ? 1.0 : 0.0);

      let mode = 0;
      const fx = fxRef.current;
      if (fx === 'blue_glint' || fx === 'golden_aura_vfx') mode = 1;
      else if (fx === 'fractal_rainbow_trail' || fx === 'infinite_loop_glow') mode = 2;
      else if (fx === 'white_hole_distortion') mode = 3;
      
      gl.uniform1i(uniforms.u_fxMode, mode);

      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block"
      style={{ display: 'block' }}
    />
  );
};

export default DrillRenderer;
