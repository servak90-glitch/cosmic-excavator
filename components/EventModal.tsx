
import React from 'react';
import { GameEvent, EventOption } from '../types';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { t } from '../services/localization';
import { audioEngine } from '../services/audioEngine';
import { useEffect } from 'react';


interface EventModalProps {
  event: GameEvent;
  onOptionSelect: (optionId?: any) => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onOptionSelect }) => {
  const lang = useGameStore(s => s.settings.language);

  useEffect(() => {
    if (event.type === 'ANOMALY' || event.type === 'WARNING') {
      audioEngine.playUIError();
    } else {
      audioEngine.playUIPanelOpen();
    }
  }, [event.id]);

  const isAnomaly = event.type === 'ANOMALY' || event.type === 'WARNING';

  const isSuccess = event.type === 'NOTIFICATION' && (t(event.title, lang).includes('ДОСТУП') || t(event.title, lang).includes('РАЗРЕШЕН') || t(event.title, lang).includes('ОПЕРАТОР'));

  let borderColor = 'border-cyan-600';
  let bgColor = 'bg-zinc-900/95';
  let textColor = 'text-cyan-400';
  let icon = '💠';

  if (isAnomaly) {
    borderColor = 'border-red-600';
    bgColor = 'bg-red-950/95';
    textColor = 'text-red-500';
    icon = '⚠️';
  } else if (isSuccess) {
    borderColor = 'border-green-500';
    bgColor = 'bg-green-950/95';
    textColor = 'text-green-400';
    icon = '✅';
  }

  // Animation Variants
  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0, y: 50 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    },
    exit: { scale: 0.8, opacity: 0, transition: { duration: 0.2 } }
  };

  const buttonVariants: Variants = {
    hover: { scale: 1.05, transition: { duration: 0.1 } },
    tap: { scale: 0.95 }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          className={`relative max-w-md w-full border-4 p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] ${borderColor} ${bgColor} overflow-hidden`}
          variants={modalVariants}
        >

          {/* Scanlines inside modal */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-0" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {event.imageUrl ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mb-6 relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-b from-cyan-500/20 to-transparent blur opacity-50" />
                <img
                  src={event.imageUrl}
                  alt={t(event.title, lang)}
                  className={`w-full aspect-video object-cover border-2 ${borderColor} shadow-lg shadow-black/40`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {isAnomaly && (
                  <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />
                )}
              </motion.div>
            ) : (
              <motion.div
                className={`text-4xl mb-4`}
                animate={isAnomaly ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] } : { scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: isAnomaly ? 0.5 : 2 }}
              >
                {icon}
              </motion.div>
            )}

            <h2 className={`pixel-text text-lg md:text-xl font-black mb-4 uppercase tracking-widest ${textColor}`}>
              {t(event.title, lang)}
            </h2>

            <div className="h-0.5 w-full bg-current opacity-30 mb-4" />

            <p className="font-mono text-sm md:text-base text-white mb-8 leading-relaxed whitespace-pre-line">
              {t(event.description, lang)}
            </p>


            <div className="flex flex-col gap-3 w-full">
              {event.options ? (
                event.options.map((opt) => (
                  <motion.button
                    key={opt.actionId}
                    onClick={() => {
                      audioEngine.playUIPanelClose();
                      onOptionSelect(opt.actionId);
                    }}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className={`group relative px-6 py-3 border-2 transition-colors
                      ${isAnomaly
                        ? 'border-red-500 hover:bg-red-500 hover:text-white text-red-500'
                        : 'border-cyan-500 hover:bg-cyan-500 hover:text-white text-cyan-500'}`}
                  >
                    <span className="pixel-text text-xs font-bold uppercase">{t(opt.label, lang)}</span>
                    {opt.risk && (
                      <span className="block text-[9px] opacity-70 mt-1 font-mono group-hover:text-white/90">
                        &gt;&gt; {t(opt.risk, lang)}
                      </span>
                    )}

                  </motion.button>
                ))
              ) : (
                <motion.button
                  onClick={() => {
                    audioEngine.playUIPanelClose();
                    onOptionSelect();
                  }}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className={`px-6 py-3 border-2 text-white hover:text-black transition-colors pixel-text text-xs font-bold uppercase
                    ${isSuccess
                      ? 'border-green-500 hover:bg-green-500'
                      : 'border-white hover:bg-white'}`}
                >
                  [ ПРИНЯТЬ ]
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventModal;
