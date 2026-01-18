
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { t, TEXT_IDS } from '../services/localization';
import { audioEngine } from '../services/audioEngine';

interface MenuOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSettings: () => void;
    onOpenHelp: () => void;
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({ isOpen, onClose, onOpenSettings, onOpenHelp }) => {
    const exitToMenu = useGameStore(s => s.exitToMenu);
    const lang = useGameStore(s => s.settings.language);

    const handleExit = () => {
        audioEngine.playUIPanelClose();
        onClose();
        exitToMenu();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="w-64 flex flex-col gap-4 p-6 border-2 border-zinc-800 bg-zinc-950 relative overflow-hidden"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                    >
                        {/* DECORATION */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 via-cyan-900 to-zinc-800" />
                        <div className="text-center mb-2">
                            <h2 className="pixel-text text-xl text-white tracking-widest">PAUSED</h2>
                            <p className="text-[10px] text-zinc-600 font-mono">SYSTEM INTERRUPT</p>
                        </div>

                        <button
                            onClick={() => { audioEngine.playUIPanelClose(); onClose(); }}
                            className="w-full py-3 bg-white text-black font-black pixel-text text-sm hover:bg-cyan-400 transition-colors"
                        >
                            RESUME
                        </button>

                        <button
                            onClick={() => { onClose(); onOpenSettings(); }}
                            className="w-full py-3 border border-zinc-700 text-zinc-300 font-bold font-mono text-xs hover:border-white hover:text-white transition-colors"
                        >
                            {t(TEXT_IDS.SETTINGS_BUTTON, lang)}
                        </button>

                        <button
                            onClick={() => { onClose(); onOpenHelp(); }}
                            className="w-full py-3 border border-zinc-700 text-zinc-300 font-bold font-mono text-xs hover:border-white hover:text-white transition-colors"
                        >
                            {t(TEXT_IDS.MANUAL_BUTTON, lang)}
                        </button>

                        <div className="h-px bg-zinc-800 my-2" />

                        <button
                            onClick={handleExit}
                            className="w-full py-3 border border-red-900/50 text-red-600 font-bold font-mono text-xs hover:bg-red-950/30 hover:border-red-600 transition-colors"
                        >
                            {t(TEXT_IDS.EXIT_BUTTON, lang)}
                        </button>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MenuOverlay;
