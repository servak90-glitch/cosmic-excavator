import React, { useState, useRef, useEffect } from 'react';
import { GameSettings, Language } from '../types';
import { t, TEXT_IDS } from '../services/localization';
import { useGameStore } from '../store/gameStore';
import { GAME_VERSION } from '../constants';
import { audioEngine } from '../services/audioEngine';
import {
    Settings,
    X,
    Save,
    Upload,
    Download,
    Copy,
    Music,
    Volume2,
    Globe,
    AlertTriangle,
    RotateCcw,
    ShieldCheck,
    Cpu,
    Database,
    Binary,
    Terminal,
    Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
    settings: GameSettings;
    onClose: () => void;
    onUpdateSettings: (settings: Partial<GameSettings>) => void;
    onResetProgress: () => void;
    language: Language;
    onSetLanguage: (lang: Language) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    settings,
    onClose,
    onUpdateSettings,
    onResetProgress,
    language,
    onSetLanguage
}) => {
    useEffect(() => {
        audioEngine.playUIPanelOpen();
    }, []);

    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [importString, setImportString] = useState("");
    const [exportMessage, setExportMessage] = useState("");
    const [importError, setImportError] = useState("");
    const [showDataSection, setShowDataSection] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    // Secret Trigger Logic
    const [secretClicks, setSecretClicks] = useState(0);
    const lastClickTimeRef = useRef(0);
    const [showDebugLogin, setShowDebugLogin] = useState(false);
    const [debugPassword, setDebugPassword] = useState("");
    const setDebugUnlocked = useGameStore(s => s.setDebugUnlocked);
    const toggleDebugUI = useGameStore(s => s.toggleDebugUI);
    const isDebugUnlocked = useGameStore(s => s.debugUnlocked);

    const exportSaveString = useGameStore(s => s.exportSaveString);
    const importSaveString = useGameStore(s => s.importSaveString);
    const manualSave = useGameStore(s => s.manualSave);
    const manualLoad = useGameStore(s => s.manualLoad);

    const handleTitleClick = () => {
        const now = Date.now();
        if (now - lastClickTimeRef.current > 1000) {
            setSecretClicks(1);
        } else {
            const newCount = secretClicks + 1;
            setSecretClicks(newCount);
            if (newCount === 7) setShowDebugLogin(true);
        }
        lastClickTimeRef.current = now;
    };

    const handleDebugLogin = () => {
        if (debugPassword === "VOID_ADMIN") {
            setDebugUnlocked(true);
            toggleDebugUI(true);
            onClose();
        } else {
            setDebugPassword("");
            setShowDebugLogin(false);
        }
    };

    const handleReset = () => {
        onResetProgress();
        onClose();
    };

    const handleExport = () => {
        const data = exportSaveString();
        if (data) {
            navigator.clipboard.writeText(data).then(() => {
                setExportMessage(t(TEXT_IDS.MSG_COPIED, language));
                setTimeout(() => setExportMessage(""), 2000);
            });
        }
    };

    const handleImport = () => {
        if (!importString) return;
        const success = importSaveString(importString);
        if (!success) {
            setImportError(t(TEXT_IDS.MSG_IMPORT_ERROR, language));
            setTimeout(() => setImportError(""), 3000);
        }
    };

    const handleManualSave = () => {
        manualSave();
        setSaveMessage(t(TEXT_IDS.MSG_DATA_SAVED, language));
        setTimeout(() => setSaveMessage(""), 2000);
    };

    const handleManualLoad = () => {
        const success = manualLoad();
        if (success) {
            setSaveMessage(t(TEXT_IDS.MSG_DATA_LOADED, language));
            setTimeout(() => onClose(), 500);
        } else {
            setSaveMessage(t(TEXT_IDS.MSG_NO_DATA, language));
            setTimeout(() => setSaveMessage(""), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-void/60 backdrop-blur-3xl p-0 md:p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full h-full md:h-auto md:max-w-xl glass-panel border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col p-0 overflow-hidden md:max-h-[90vh]"
            >
                {/* Header Bento */}
                <div className="bg-white/[0.03] border-b border-white/5 p-6 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
                    <div className="flex items-center gap-3 z-10 shrink-0">
                        <div className="p-2 glass-panel border-white/10 bg-white/5">
                            <Settings className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h2 onClick={handleTitleClick} className="text-sm md:text-xl font-black font-technical uppercase tracking-tighter text-white select-none cursor-default italic truncate mr-4">
                            {t(TEXT_IDS.SETTINGS_CONFIG_TITLE, language)}_V{GAME_VERSION}
                        </h2>
                    </div>
                    <button onClick={() => { audioEngine.playUIPanelClose(); onClose(); }} className="p-2 glass-panel hover:bg-rose-500/20 hover:text-rose-400 text-white/40 transition-all z-10">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto scrollbar-hide space-y-8 bg-black/20">

                    {/* BLACK BOX - DATA CONTROL */}
                    <section className="glass-panel p-5 border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <div>
                                    <h3 className="text-xs font-black font-technical text-emerald-400 uppercase tracking-widest">{t(TEXT_IDS.SETTINGS_BLACK_BOX, language)}</h3>
                                    <p className="text-[9px] text-white/30 font-technical uppercase mt-0.5">{t(TEXT_IDS.SETTINGS_MANUAL_MEM, language)}</p>
                                </div>
                            </div>
                            {saveMessage && (
                                <span className="text-[9px] font-black font-technical text-emerald-400 px-3 py-1 glass-panel border-emerald-500/30 bg-emerald-500/10 animate-pulse">
                                    {saveMessage}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={handleManualSave} className="flex items-center justify-center gap-3 py-4 glass-panel border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 group transition-all">
                                <Save className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                                <div className="text-left">
                                    <div className="text-[10px] font-black font-technical text-white uppercase">{t(TEXT_IDS.SETTINGS_SAVE_BTN, language)}</div>
                                    <div className="text-[7px] text-white/30 font-technical uppercase">{t(TEXT_IDS.SETTINGS_SAVE_SUB, language)}</div>
                                </div>
                            </button>
                            <button onClick={handleManualLoad} className="flex items-center justify-center gap-3 py-4 glass-panel border-white/10 bg-white/5 hover:bg-white/10 group transition-all">
                                <RotateCcw className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                                <div className="text-left">
                                    <div className="text-[10px] font-black font-technical text-white uppercase">{t(TEXT_IDS.SETTINGS_LOAD_BTN, language)}</div>
                                    <div className="text-[7px] text-white/30 font-technical uppercase">{t(TEXT_IDS.SETTINGS_LOAD_SUB, language)}</div>
                                </div>
                            </button>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* LANGUAGE HUB */}
                        <section className="glass-panel p-5 bg-white/[0.03] border-white/10">
                            <div className="flex items-center gap-3 mb-6">
                                <Globe className="w-4 h-4 text-cyan-400" />
                                <h3 className="text-[10px] font-black font-technical text-white/60 uppercase tracking-widest">{t(TEXT_IDS.SETTINGS_LOCALIZATION_BUS, language)}</h3>
                            </div>
                            <div className="flex gap-2">
                                {(['RU', 'EN'] as Language[]).map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => onSetLanguage(lang)}
                                        className={`flex-1 py-3 text-sm font-black font-technical border transition-all
                                            ${language === lang ? 'bg-cyan-400 text-black border-cyan-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* GRAPHICS CONFIG */}
                        <section className="glass-panel p-5 bg-white/[0.03] border-white/10">
                            <div className="flex items-center gap-3 mb-6">
                                <Monitor className="w-4 h-4 text-cyan-400" />
                                <h3 className="text-[10px] font-black font-technical text-white/60 uppercase tracking-widest">{t(TEXT_IDS.SETTINGS_GRAPHICS_RENDERER, language)}</h3>
                            </div>
                            <div className="flex gap-2">
                                {(['low', 'medium', 'high'] as const).map(quality => (
                                    <button
                                        key={quality}
                                        onClick={() => onUpdateSettings({ graphicsQuality: quality })}
                                        className={`flex-1 py-3 text-[10px] font-black font-technical border transition-all uppercase
                                            ${settings.graphicsQuality === quality ? 'bg-cyan-400 text-black border-cyan-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}
                                    >
                                        {quality}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* DEBUG MODULE */}
                        <section className="glass-panel p-5 bg-white/[0.03] border-white/10 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-4">
                                <Binary className="w-4 h-4 text-white/30" />
                                <h3 className="text-[10px] font-black font-technical text-white/30 uppercase tracking-widest">{t(TEXT_IDS.SETTINGS_INTERNAL_BYPASS, language)}</h3>
                            </div>
                            {(showDebugLogin || isDebugUnlocked) && (
                                <div className="space-y-3">
                                    {isDebugUnlocked ? (
                                        <button onClick={() => { toggleDebugUI(true); onClose(); }} className="w-full py-2.5 glass-panel border-cyan-500/30 bg-cyan-500/5 text-[9px] font-black font-technical text-cyan-400 uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all">
                                            {t(TEXT_IDS.SETTINGS_BTN_DEV_CONSOLE, language)}
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="password"
                                                placeholder={t(TEXT_IDS.SETTINGS_PLACEHOLDER_ACCESS_CODE, language)}
                                                className="flex-1 bg-black/40 border border-white/10 text-cyan-400 font-technical text-[10px] px-3 outline-none focus:border-cyan-400"
                                                value={debugPassword}
                                                onChange={(e) => setDebugPassword(e.target.value)}
                                            />
                                            <button onClick={handleDebugLogin} className="px-4 py-2 glass-panel border-white/10 bg-white/5 text-[9px] font-black font-technical text-white hover:bg-white hover:text-black">
                                                {t(TEXT_IDS.SETTINGS_BTN_VERIFY, language)}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* AUDIO MASTER BUS */}
                    <section className="glass-panel p-5 bg-white/[0.02] border-white/5">
                        <div className="flex items-center gap-3 mb-8">
                            <Music className="w-4 h-4 text-cyan-400" />
                            <h3 className="text-xs font-black font-technical text-white uppercase tracking-widest">{t(TEXT_IDS.SETTINGS_AUDIO_MIXER, language)}</h3>
                            <div className="h-px bg-white/5 flex-1" />
                        </div>

                        <div className="space-y-8">
                            {[
                                { id: 'music', label: TEXT_IDS.MUSIC_VOLUME, val: settings.musicVolume, muted: settings.musicMuted },
                                { id: 'sfx', label: TEXT_IDS.SFX_VOLUME, val: settings.sfxVolume, muted: settings.sfxMuted },
                                { id: 'drill', label: TEXT_IDS.DRILL_VOLUME, val: settings.drillVolume, muted: settings.drillMuted }
                            ].map(bus => (
                                <div key={bus.id} className="group">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <Volume2 className={`w-3.5 h-3.5 ${bus.muted ? 'text-rose-500' : 'text-cyan-400'}`} />
                                            <span className="text-[10px] font-black font-technical text-white/50 uppercase tracking-widest">{t(bus.label, language)}</span>
                                        </div>
                                        <button
                                            onClick={() => onUpdateSettings({ [`${bus.id}Muted`]: !bus.muted })}
                                            className={`px-3 py-1 rounded-full text-[8px] font-black font-technical transition-all
                                                ${bus.muted ? 'bg-rose-500 text-black' : 'bg-white/10 text-cyan-400 hover:bg-cyan-500/20'}`}
                                        >
                                            {bus.muted ? t(TEXT_IDS.SETTINGS_STATUS_MUTED, language) : t(TEXT_IDS.SETTINGS_STATUS_ONLINE, language)}
                                        </button>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="1" step="0.05"
                                        value={bus.val}
                                        onChange={(e) => onUpdateSettings({ [`${bus.id}Volume`]: parseFloat(e.target.value) })}
                                        className="w-full h-1 bg-white/5 appearance-none cursor-pointer accent-cyan-400"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* DATA RECOVERY - COLLAPSIBLE */}
                    <section className="glass-panel border-white/5 overflow-hidden">
                        <button
                            onClick={() => setShowDataSection(!showDataSection)}
                            className="w-full p-4 flex justify-between items-center group hover:bg-white/5 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <Database className="w-4 h-4 text-white/30 group-hover:text-white" />
                                <span className="text-[10px] font-black font-technical text-white/40 group-hover:text-white uppercase tracking-widest">{t(TEXT_IDS.SETTINGS_BACKUP_TITLE, language)}</span>
                            </div>
                            <Terminal className={`w-4 h-4 text-white/20 transition-transform ${showDataSection ? 'rotate-90' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showDataSection && (
                                <motion.div
                                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                    className="px-4 pb-6 border-t border-white/5"
                                >
                                    <div className="mt-6 space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-[8px] font-black font-technical uppercase">
                                                <span className="text-white/20">{t(TEXT_IDS.SETTINGS_CODE_LABEL, language)}</span>
                                                {exportMessage && <span className="text-emerald-400 animate-pulse">{exportMessage}</span>}
                                            </div>
                                            <button onClick={handleExport} className="w-full py-4 glass-panel border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-3 group">
                                                <Copy className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] font-black font-technical text-white uppercase">{t(TEXT_IDS.SETTINGS_COPY_CLIPBOARD, language)}</span>
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-[8px] font-black font-technical uppercase">
                                                <span className="text-white/20">{t(TEXT_IDS.SETTINGS_RESTORE_LABEL, language)}</span>
                                                {importError && <span className="text-rose-500 animate-pulse">{importError}</span>}
                                            </div>
                                            <textarea
                                                value={importString}
                                                onChange={(e) => setImportString(e.target.value)}
                                                placeholder={t(TEXT_IDS.SETTINGS_IMPORT_PLACEHOLDER, language)}
                                                className="w-full h-24 bg-black/40 border border-white/10 rounded-sm text-cyan-400 font-mono text-[9px] p-3 outline-none focus:border-cyan-400/50 resize-none"
                                            />
                                            <button onClick={handleImport} className="w-full py-4 glass-panel border-white/10 bg-white/5 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center gap-3">
                                                <Download className="w-4 h-4" />
                                                <span className="text-[10px] font-black font-technical uppercase">{t(TEXT_IDS.SETTINGS_APPLY_CODE, language)}</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>

                    {/* SYSTEM PURGE - RESET */}
                    <section className="pt-8 border-t border-white/5">
                        {!showResetConfirm ? (
                            <button
                                onClick={() => setShowResetConfirm(true)}
                                className="w-full py-4 glass-panel border-rose-500/20 hover:border-rose-500 text-rose-500 text-[10px] font-black font-technical uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-rose-500/5 transition-all"
                            >
                                <RotateCcw className="w-4 h-4" />
                                {t(TEXT_IDS.RESET_PROGRESS, language)}
                            </button>
                        ) : (
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel border-rose-600 bg-rose-500/5 p-6 text-center">
                                <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
                                <h3 className="text-rose-500 font-black text-sm uppercase font-technical mb-2 tracking-widest">{t(TEXT_IDS.RESET_CONFIRM_TITLE, language)}</h3>
                                <p className="text-white/50 text-[10px] font-technical uppercase mb-6 leading-relaxed px-4">
                                    {t(TEXT_IDS.RESET_CONFIRM_BODY, language)}
                                </p>
                                <div className="flex gap-4">
                                    <button onClick={handleReset} className="flex-1 py-4 bg-rose-600 text-white font-black font-technical text-[10px] uppercase hover:bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                                        {t(TEXT_IDS.BTN_OK, language)}
                                    </button>
                                    <button onClick={() => { audioEngine.playUIPanelClose(); setShowResetConfirm(false); }} className="flex-1 py-4 glass-panel border-white/10 text-white font-black font-technical text-[10px] uppercase hover:bg-white hover:text-black">
                                        {t(TEXT_IDS.BTN_CANCEL, language)}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </section>

                    <div className="pt-4 text-center">
                        <span className="text-[9px] text-white/10 font-technical font-black tracking-[0.5em] select-none">{t(TEXT_IDS.SETTINGS_BUILD_REVISION, language)}_V{GAME_VERSION}</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SettingsModal;
