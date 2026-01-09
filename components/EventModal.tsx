
import React from 'react';
import { GameEvent, EventOption } from '../types';

interface EventModalProps {
  event: GameEvent;
  onOptionSelect: (optionId?: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onOptionSelect }) => {
  const isAnomaly = event.type === 'ANOMALY' || event.type === 'WARNING';
  // Считаем событие "Успехом" или "Сюжетом", если это NOTIFICATION и в заголовке есть ключевые слова
  const isSuccess = event.type === 'NOTIFICATION' && (event.title.includes('ДОСТУП') || event.title.includes('РАЗРЕШЕН') || event.title.includes('ОПЕРАТОР'));

  let borderColor = 'border-cyan-600';
  let bgColor = 'bg-zinc-900/95';
  let textColor = 'text-cyan-400';
  let icon = '💠';

  if (isAnomaly) {
    borderColor = 'border-red-600';
    bgColor = 'bg-red-950/90';
    textColor = 'text-red-500';
    icon = '⚠️';
  } else if (isSuccess) {
    borderColor = 'border-green-500';
    bgColor = 'bg-green-950/95';
    textColor = 'text-green-400';
    icon = '✅';
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`relative max-w-md w-full border-4 p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] ${borderColor} ${bgColor}`}>
        
        {/* Scanlines inside modal */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-0" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className={`text-4xl mb-4 ${isAnomaly ? 'animate-bounce' : 'animate-pulse'}`}>
            {icon}
          </div>
          
          <h2 className={`pixel-text text-lg md:text-xl font-black mb-4 uppercase tracking-widest ${textColor}`}>
            {event.title}
          </h2>
          
          <div className="h-0.5 w-full bg-current opacity-30 mb-4" />
          
          <p className="font-mono text-sm md:text-base text-white mb-8 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>

          <div className="flex flex-col gap-3 w-full">
            {event.options ? (
              event.options.map((opt) => (
                <button
                  key={opt.actionId}
                  onClick={() => onOptionSelect(opt.actionId)}
                  className={`group relative px-6 py-3 border-2 transition-all active:scale-95
                    ${isAnomaly 
                      ? 'border-red-500 hover:bg-red-500 hover:text-white text-red-500' 
                      : 'border-cyan-500 hover:bg-cyan-500 hover:text-white text-cyan-500'}`}
                >
                  <span className="pixel-text text-xs font-bold uppercase">{opt.label}</span>
                  {opt.risk && (
                    <span className="block text-[9px] opacity-70 mt-1 font-mono group-hover:text-white/90">
                      >> {opt.risk}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <button
                onClick={() => onOptionSelect()}
                className={`px-6 py-3 border-2 text-white hover:text-black transition-all pixel-text text-xs font-bold uppercase
                  ${isSuccess 
                    ? 'border-green-500 hover:bg-green-500' 
                    : 'border-white hover:bg-white'}`}
              >
                [ ПРИНЯТЬ ]
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
