
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface ParticleHandle {
  emit: (x: number, y: number, color: string, type: 'DEBRIS' | 'SPARK' | 'SMOKE', count: number) => void;
}

const MAX_PARTICLES = 2000;

const ParticleRenderer = forwardRef<ParticleHandle, {}>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Data Arrays (SOA - Structure of Arrays for performance)
  const positions = useRef(new Float32Array(MAX_PARTICLES * 2)); // x, y
  const velocities = useRef(new Float32Array(MAX_PARTICLES * 2)); // vx, vy
  const colors = useRef(new Float32Array(MAX_PARTICLES * 3));    // r, g, b
  const life = useRef(new Float32Array(MAX_PARTICLES));          // 0.0 - 1.0
  const sizes = useRef(new Float32Array(MAX_PARTICLES));         // size
  const types = useRef(new Float32Array(MAX_PARTICLES));         // 0=DEBRIS, 1=SPARK, 2=SMOKE

  const activeCount = useRef(0);
  const particleCursor = useRef(0); // Circular buffer cursor

  const getHexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  };

  useImperativeHandle(ref, () => ({
    emit: (x, y, hexColor, typeStr, count) => {
      const [r, g, b] = getHexToRgb(hexColor);
      let typeCode = 0;
      if (typeStr === 'SPARK') typeCode = 1;
      if (typeStr === 'SMOKE') typeCode = 2;

      for (let i = 0; i < count; i++) {
        const idx = particleCursor.current;
        
        positions.current[idx * 2] = x;
        positions.current[idx * 2 + 1] = y;

        // Physics Logic based on Type
        if (typeCode === 0) { // DEBRIS
           const angle = (Math.random() - 0.5) * Math.PI; // Spread upwards/sideways
           const speed = Math.random() * 0.5 + 0.2;
           velocities.current[idx * 2] = Math.sin(angle) * speed;
           velocities.current[idx * 2 + 1] = -Math.cos(angle) * speed - 0.2; // Initial upward burst
           life.current[idx] = 1.0 + Math.random() * 0.5;
           sizes.current[idx] = Math.random() * 4.0 + 2.0;
           colors.current[idx * 3] = r + (Math.random() - 0.5) * 0.1;
           colors.current[idx * 3 + 1] = g + (Math.random() - 0.5) * 0.1;
           colors.current[idx * 3 + 2] = b + (Math.random() - 0.5) * 0.1;
        } else if (typeCode === 1) { // SPARK
           const angle = Math.random() * Math.PI * 2;
           const speed = Math.random() * 1.5 + 0.5;
           velocities.current[idx * 2] = Math.cos(angle) * speed;
           velocities.current[idx * 2 + 1] = Math.sin(angle) * speed;
           life.current[idx] = 0.3 + Math.random() * 0.2;
           sizes.current[idx] = Math.random() * 2.0 + 1.0;
           colors.current[idx * 3] = 1.0;
           colors.current[idx * 3 + 1] = 0.8 + Math.random() * 0.2;
           colors.current[idx * 3 + 2] = 0.2;
        } else { // SMOKE
           velocities.current[idx * 2] = (Math.random() - 0.5) * 0.2;
           velocities.current[idx * 2 + 1] = -Math.random() * 0.5 - 0.2; // Float up
           life.current[idx] = 2.0 + Math.random();
           sizes.current[idx] = Math.random() * 10.0 + 5.0;
           colors.current[idx * 3] = 0.2;
           colors.current[idx * 3 + 1] = 0.2;
           colors.current[idx * 3 + 2] = 0.2;
        }

        types.current[idx] = typeCode;

        particleCursor.current = (particleCursor.current + 1) % MAX_PARTICLES;
        if (activeCount.current < MAX_PARTICLES) activeCount.current++;
      }
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // PERFORMANCE: Use powerPreference to request dedicated GPU if available
    const gl = canvas.getContext('webgl2', { 
      alpha: true, 
      premultipliedAlpha: false,
      powerPreference: 'high-performance' 
    });
    if (!gl) return;

    // --- SHADER SETUP ---
    const vsSource = `#version 300 es
      in vec2 a_position;
      in vec3 a_color;
      in float a_size;
      in float a_life;
      in float a_type;

      uniform vec2 u_resolution;

      out vec3 v_color;
      out float v_life;
      out float v_type;

      void main() {
        if (a_life <= 0.0) {
           gl_Position = vec4(-2.0, -2.0, 0.0, 1.0); // Discard by moving off-screen
           return;
        }
        // Convert pixel coords to clip space -1 to +1
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        clipSpace.y = -clipSpace.y; // Flip Y
        gl_Position = vec4(clipSpace, 0, 1);
        gl_PointSize = a_size * (a_type == 1.0 ? 1.0 : (2.0 - a_life)); 
        
        v_color = a_color;
        v_life = a_life;
        v_type = a_type;
      }
    `;

    const fsSource = `#version 300 es
      precision lowp float; // PERFORMANCE: Low precision is enough for particles
      in vec3 v_color;
      in float v_life;
      in float v_type;
      out vec4 outColor;

      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float distSq = dot(coord, coord); // PERFORMANCE: Avoid length() sqrt
        if (distSq > 0.25) discard; // 0.5 * 0.5 = 0.25

        float alpha = 1.0;
        
        // Debris fade
        if (v_type == 0.0) { 
           alpha = min(1.0, v_life * 2.0); 
        }
        // Spark fast fade
        else if (v_type == 1.0) { 
           alpha = v_life * 3.0; 
        }
        // Smoke transparent
        else if (v_type == 2.0) {
           float dist = sqrt(distSq); // Need sqrt here for soft edge
           alpha = min(0.3, v_life * 0.2);
           float edge = 1.0 - dist*2.0;
           alpha *= edge;
        }

        outColor = vec4(v_color * alpha, alpha);
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

    // --- OPTIMIZATION: USE VAO (Vertex Array Object) ---
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Helper to create and bind buffer to attribute
    const createAndBind = (data: Float32Array, attribName: string, size: number) => {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
        const loc = gl.getAttribLocation(program, attribName);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
        return buffer;
    };

    const posBuffer = createAndBind(positions.current, 'a_position', 2);
    const colBuffer = createAndBind(colors.current, 'a_color', 3);
    const sizeBuffer = createAndBind(sizes.current, 'a_size', 1);
    const lifeBuffer = createAndBind(life.current, 'a_life', 1);
    const typeBuffer = createAndBind(types.current, 'a_type', 1);

    const locRes = gl.getUniformLocation(program, 'u_resolution');

    // Unbind VAO to prevent accidental modification
    gl.bindVertexArray(null);

    let frameId = 0;

    const render = () => {
       // --- PHYSICS UPDATE (CPU) ---
       // This is O(N) but JS is fast enough for 2000 simple items.
       const count = MAX_PARTICLES; 
       
       for (let i = 0; i < count; i++) {
          if (life.current[i] > 0) {
             // Move
             positions.current[i*2] += velocities.current[i*2];
             positions.current[i*2+1] += velocities.current[i*2+1];
             
             const type = types.current[i];
             // Simple Physics
             if (type === 0) { // Debris
                velocities.current[i*2+1] += 0.05; 
             } else if (type === 2) { // Smoke
                velocities.current[i*2+1] -= 0.005; 
                velocities.current[i*2] += (Math.random()-0.5)*0.05; 
             }

             // Decay
             life.current[i] -= 0.016; 
          }
       }

       // --- RENDER (GPU) ---
       gl.viewport(0, 0, canvas.width, canvas.height);
       gl.clearColor(0, 0, 0, 0);
       gl.clear(gl.COLOR_BUFFER_BIT);
       
       gl.useProgram(program);
       gl.uniform2f(locRes, canvas.width, canvas.height);
       
       gl.enable(gl.BLEND);
       gl.blendFunc(gl.SRC_ALPHA, gl.ONE); 

       // PERFORMANCE: Bind VAO once, then just update data
       gl.bindVertexArray(vao);

       // Update Buffers (CPU -> GPU Transfer)
       // We update the whole buffer because identifying dirty ranges is more costly in JS for small N
       gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
       gl.bufferData(gl.ARRAY_BUFFER, positions.current, gl.DYNAMIC_DRAW);
       
       gl.bindBuffer(gl.ARRAY_BUFFER, lifeBuffer);
       gl.bufferData(gl.ARRAY_BUFFER, life.current, gl.DYNAMIC_DRAW);
       
       // Only update these if necessary? For now update all for correctness
       gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
       gl.bufferData(gl.ARRAY_BUFFER, colors.current, gl.DYNAMIC_DRAW);
       
       gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
       gl.bufferData(gl.ARRAY_BUFFER, sizes.current, gl.DYNAMIC_DRAW);
       
       gl.bindBuffer(gl.ARRAY_BUFFER, typeBuffer);
       gl.bufferData(gl.ARRAY_BUFFER, types.current, gl.DYNAMIC_DRAW);

       gl.drawArrays(gl.POINTS, 0, MAX_PARTICLES);
       
       gl.bindVertexArray(null); // Cleanup

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
       gl.deleteProgram(program);
       gl.deleteVertexArray(vao);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-30" />;
});

export default ParticleRenderer;
