
import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';

export interface FloatingTextHandle {
  addText: (x: number, y: number, text: string, type?: 'DAMAGE' | 'RESOURCE' | 'CRIT' | 'HEAL' | 'INFO' | 'EVADE' | 'BLOCKED') => void;
}

interface TextItem {
  id: number;
  x: number;
  y: number;
  text: string;
  type: 'DAMAGE' | 'RESOURCE' | 'CRIT' | 'HEAL' | 'INFO' | 'EVADE' | 'BLOCKED';
}

const FloatingTextOverlay = forwardRef<FloatingTextHandle, {}>((props, ref) => {
  const [items, setItems] = useState<TextItem[]>([]);
  const counterRef = useRef(0);

  useImperativeHandle(ref, () => ({
    addText: (x, y, text, type = 'INFO') => {
      const id = counterRef.current++;
      // Randomize position slightly to prevent stacking
      const offsetX = (Math.random() - 0.5) * 40;
      const offsetY = (Math.random() - 0.5) * 20;

      setItems(prev => [...prev, { id, x: x + offsetX, y: y + offsetY, text, type }]);

      // Auto-remove after animation
      setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== id));
      }, 1000);
    }
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {items.map(item => {
        let colorClass = 'text-white';
        let sizeClass = 'text-xs md:text-sm';
        let fontClass = 'font-mono font-bold';

        if (item.type === 'DAMAGE') {
          colorClass = 'text-white drop-shadow-[0_0_2px_black]';
        } else if (item.type === 'CRIT') {
          colorClass = 'text-yellow-400 drop-shadow-[0_0_5px_red]';
          sizeClass = 'text-lg md:text-2xl';
          fontClass = 'pixel-text';
        } else if (item.type === 'RESOURCE') {
          colorClass = 'text-green-400 drop-shadow-[0_0_2px_black]';
        } else if (item.type === 'HEAL') {
          colorClass = 'text-cyan-400';
        } else if (item.type === 'INFO') {
          colorClass = 'text-zinc-400 text-[10px]';
        } else if (item.type === 'EVADE') {
          colorClass = 'text-zinc-300 opacity-80';
          sizeClass = 'text-sm';
          fontClass = 'font-mono italic';
        } else if (item.type === 'BLOCKED') {
          colorClass = 'text-blue-400 opacity-90';
          sizeClass = 'text-sm';
          fontClass = 'font-mono';
        }

        return (
          <div
            key={item.id}
            className={`absolute ${colorClass} ${sizeClass} ${fontClass} animate-float-up select-none`}
            style={{ left: item.x, top: item.y }}
          >
            {item.text}
          </div>
        );
      })}
    </div>
  );
});

export default FloatingTextOverlay;
