
import React, { useEffect, useState } from 'react';
import { AIState } from '../types';

interface AICompanionProps {
  state: AIState;
  heat: number;
}

const FACES: Record<AIState, string> = {
  LUCID: '( O _ O )',
  MANIC: '( ! _ ! )',
  DEPRESSED: '( . _ . )',
  BROKEN: '[ # _ % ]'
};

const COLORS: Record<AIState, string> = {
  LUCID: 'text-cyan-400',
  MANIC: 'text-red-500',
  DEPRESSED: 'text-zinc-500',
  BROKEN: 'text-purple-500'
};

const AICompanion: React.FC<AICompanionProps> = ({ state, heat }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => f + 1);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const face = FACES[state] || FACES.LUCID;
  const color = COLORS[state] || COLORS.LUCID;

  // Dynamic CSS classes based on state
  let animClass = '';
  if (state === 'MANIC') animClass = 'animate-bounce';
  if (state === 'BROKEN') animClass = 'animate-pulse skew-x-12';
  if (state === 'LUCID' && heat > 50) animClass = 'animate-pulse';

  // Breathing effect for Lucid idle state
  const breathing = state === 'LUCID' ? { transform: `scale(${1 + Math.sin(frame * 0.5) * 0.05})` } : {};

  return (
    <div className={`
      fixed 
      bottom-36 right-2       /* Mobile: Higher up to clear console */
      md:bottom-20 md:right-8 /* Desktop: Standard corner position */
      min-w-[6rem] w-auto px-2 h-20 md:h-32 
      bg-black/80 border-2 border-zinc-700 
      flex flex-col items-center justify-center 
      z-40 pointer-events-none select-none
      backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.8)]
    `}>
      {/* Scanline */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] opacity-20" />

      {/* Label */}
      <div className="absolute top-1 left-1 text-[8px] font-mono text-zinc-500">AI-CORE</div>

      {/* Face */}
      <div
        className={`text-xs md:text-2xl font-black pixel-text ${color} ${animClass} whitespace-nowrap`}
        style={breathing}
      >
        {state === 'BROKEN' ? (Math.random() > 0.5 ? face : '[ ERROR ]') : face}
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-2 w-3/4 h-1 bg-zinc-800">
        <div
          className={`h-full transition-all duration-300 ${heat > 80 ? 'bg-red-500' : 'bg-cyan-500'}`}
          style={{ width: `${Math.min(100, heat)}%` }}
        />
      </div>
    </div>
  );
};

export default AICompanion;
