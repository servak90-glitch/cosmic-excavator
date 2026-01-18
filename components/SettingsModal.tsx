
import React, { useState, useRef } from 'react';
import { GameSettings, Language } from '../types';
import { t, TEXT_IDS } from '../services/localization';
import { useGameStore } from '../store/gameStore';
import { GAME_VERSION } from '../constants';
import { audioEngine } from '../services/audioEngine';
import { useEffect } from 'react';

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

    // Manual Actions
    const manualSave = useGameStore(s => s.manualSave);
    const manualLoad = useGameStore(s => s.manualLoad);

    const handleTitleClick = () => {
        const now = Date.now();
        if (now - lastClickTimeRef.current > 1000) {
            setSecretClicks(1);
        } else {
            const newCount = secretClicks + 1;
            setSecretClicks(newCount);
            if (newCount === 7) {
                setShowDebugLogin(true);
            }
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
        } else {
            setExportMessage(t(TEXT_IDS.MSG_EXPORT_ERROR, language));
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
            setTimeout(() => onClose(), 500); // Close to show game
        } else {
            setSaveMessage(t(TEXT_IDS.MSG_NO_DATA, language));
            setTimeout(() => setSaveMessage(""), 2000);
        }
    };


    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="relative w-full max-w-md bg-zinc-950 border-2 border-zinc-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col p-6 overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide">

                {/* CRT Scanline */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-0" />

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-2">
                        <h2
                            onClick={handleTitleClick}
                            className="pixel-text text-xl text-cyan-400 tracking-widest select-none cursor-default"
                        >
                            {t(TEXT_IDS.SETTINGS_TITLE, language)}
                        </h2>
                        <button onClick={() => { audioEngine.playUIPanelClose(); onClose(); }} className="text-zinc-500 hover:text-white text-xl">✕</button>
                    </div>

                    <div className="space-y-6">
                        {/* MANUAL SAVE STATION */}
                        <div className="border border-green-900 bg-green-950/20 p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-green-500 font-black text-sm pixel-text">{t(TEXT_IDS.SETTINGS_BLACK_BOX, language)}</h3>
                                    <p className="text-[9px] text-zinc-500 font-mono leading-tight">{t(TEXT_IDS.SETTINGS_MANUAL_MEM, language)}</p>
                                </div>

                                {saveMessage && <span className="text-[10px] text-green-300 font-mono animate-pulse bg-green-900/50 px-2 py-1">{saveMessage}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <button
                                    onClick={handleManualSave}
                                    className="py-3 bg-zinc-900 border border-green-700 hover:bg-green-900/50 text-green-400 font-bold font-mono text-xs flex flex-col items-center justify-center"
                                >
                                    <span>{t(TEXT_IDS.SETTINGS_SAVE_BTN, language)}</span>
                                    <span className="text-[8px] opacity-50 mt-1">{t(TEXT_IDS.SETTINGS_SAVE_SUB, language)}</span>
                                </button>

                                <button
                                    onClick={handleManualLoad}
                                    className="py-3 bg-zinc-900 border border-zinc-600 hover:bg-zinc-800 text-zinc-300 font-bold font-mono text-xs flex flex-col items-center justify-center"
                                >
                                    <span>{t(TEXT_IDS.SETTINGS_LOAD_BTN, language)}</span>
                                    <span className="text-[8px] opacity-50 mt-1">{t(TEXT_IDS.SETTINGS_LOAD_SUB, language)}</span>
                                </button>

                            </div>
                            <p className="text-[8px] text-red-500/80 mt-2 text-center font-mono">
                                {t(TEXT_IDS.SETTINGS_SAVE_WARNING, language)}
                            </p>

                        </div>

                        {/* LANGUAGE */}
                        <div className="flex justify-between items-center bg-zinc-900/50 p-3 border border-zinc-800">
                            <span className="font-mono text-zinc-300 text-sm font-bold">LANGUAGE</span>
                            <div className="flex gap-2">
                                {(['RU', 'EN'] as Language[]).map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => onSetLanguage(lang)}
                                        className={`px-3 py-1 font-bold text-xs border ${language === lang ? 'bg-cyan-900 border-cyan-500 text-cyan-400' : 'bg-black border-zinc-700 text-zinc-500 hover:text-white'}`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* AUDIO */}
                        <div className="space-y-4 bg-zinc-900/50 p-3 border border-zinc-800">
                            {/* MUSIC */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-mono text-zinc-300 text-xs font-bold">{t(TEXT_IDS.MUSIC_VOLUME, language)}</span>
                                    <button
                                        onClick={() => onUpdateSettings({ musicMuted: !settings.musicMuted })}
                                        className={`text-[10px] px-2 py-0.5 border ${settings.musicMuted ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}
                                    >
                                        {settings.musicMuted ? 'OFF' : 'ON'}
                                    </button>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.05"
                                    value={settings.musicVolume}
                                    onChange={(e) => onUpdateSettings({ musicVolume: parseFloat(e.target.value) })}
                                    className="w-full accent-cyan-500 h-1 bg-zinc-800 appearance-none cursor-pointer"
                                />
                            </div>

                            {/* SFX */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-mono text-zinc-300 text-xs font-bold">{t(TEXT_IDS.SFX_VOLUME, language)}</span>
                                    <button
                                        onClick={() => onUpdateSettings({ sfxMuted: !settings.sfxMuted })}
                                        className={`text-[10px] px-2 py-0.5 border ${settings.sfxMuted ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}
                                    >
                                        {settings.sfxMuted ? 'OFF' : 'ON'}
                                    </button>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.05"
                                    value={settings.sfxVolume}
                                    onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
                                    className="w-full accent-cyan-500 h-1 bg-zinc-800 appearance-none cursor-pointer"
                                />
                            </div>

                            {/* DRILL SFX */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-mono text-zinc-300 text-xs font-bold">{t(TEXT_IDS.DRILL_VOLUME, language)}</span>
                                    <button
                                        onClick={() => onUpdateSettings({ drillMuted: !settings.drillMuted })}
                                        className={`text-[10px] px-2 py-0.5 border ${settings.drillMuted ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}
                                    >
                                        {settings.drillMuted ? 'OFF' : 'ON'}
                                    </button>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.05"
                                    value={settings.drillVolume}
                                    onChange={(e) => onUpdateSettings({ drillVolume: parseFloat(e.target.value) })}
                                    className="w-full accent-cyan-500 h-1 bg-zinc-800 appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* DATA MANAGEMENT */}
                        <div className="border border-zinc-800 bg-zinc-900/30">
                            <button
                                onClick={() => setShowDataSection(!showDataSection)}
                                className="w-full p-3 flex justify-between items-center text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                            >
                                <span>{t(TEXT_IDS.SETTINGS_BACKUP_TITLE, language)}</span>
                                <span>{showDataSection ? '▲' : '▼'}</span>
                            </button>


                            {showDataSection && (
                                <div className="p-3 border-t border-zinc-800 space-y-4 animate-in slide-in-from-top-2">
                                    {/* EXPORT */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] text-zinc-500">{t(TEXT_IDS.SETTINGS_CODE_LABEL, language)}</span>
                                            {exportMessage && <span className="text-[10px] text-green-400 animate-pulse">{exportMessage}</span>}
                                        </div>
                                        <button onClick={handleExport} className="w-full py-2 bg-zinc-800 hover:bg-cyan-900/50 border border-zinc-600 text-cyan-400 text-xs font-mono">
                                            {t(TEXT_IDS.SETTINGS_COPY_CLIPBOARD, language)}
                                        </button>
                                    </div>


                                    {/* IMPORT */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] text-zinc-500">{t(TEXT_IDS.SETTINGS_RESTORE_LABEL, language)}</span>
                                            {importError && <span className="text-[10px] text-red-500 animate-pulse">{importError}</span>}
                                        </div>
                                        <textarea
                                            value={importString}
                                            onChange={(e) => setImportString(e.target.value)}
                                            placeholder={t(TEXT_IDS.SETTINGS_IMPORT_PLACEHOLDER, language)}
                                            className="w-full h-16 bg-black border border-zinc-700 text-green-500 font-mono text-[9px] p-2 outline-none focus:border-green-500 resize-none mb-2"
                                        />
                                        <button onClick={handleImport} className="w-full py-2 bg-zinc-800 hover:bg-green-900/50 border border-zinc-600 text-green-400 text-xs font-mono">
                                            {t(TEXT_IDS.SETTINGS_APPLY_CODE, language)}
                                        </button>
                                    </div>

                                </div>
                            )}
                        </div>

                        {/* RESET */}
                        <div className="pt-4 border-t border-zinc-800">
                            {!showResetConfirm ? (
                                <button
                                    onClick={() => setShowResetConfirm(true)}
                                    className="w-full py-3 border border-red-900 text-red-500 hover:bg-red-900/20 hover:text-red-400 font-bold font-mono text-xs transition-colors"
                                >
                                    {t(TEXT_IDS.RESET_PROGRESS, language)}
                                </button>
                            ) : (
                                <div className="bg-red-950/30 border border-red-600 p-4 text-center animate-in fade-in zoom-in-95">
                                    <h3 className="text-red-500 font-black mb-2 text-sm">{t(TEXT_IDS.RESET_CONFIRM_TITLE, language)}</h3>
                                    <p className="text-zinc-300 text-[10px] mb-4 leading-tight">
                                        {t(TEXT_IDS.RESET_CONFIRM_BODY, language)}
                                    </p>
                                    <div className="flex gap-2">
                                        <button onClick={handleReset} className="flex-1 bg-red-600 hover:bg-red-500 text-black font-bold py-2 text-xs">
                                            {t(TEXT_IDS.BTN_OK, language)}
                                        </button>
                                        <button onClick={() => { audioEngine.playUIPanelClose(); setShowResetConfirm(false); }} className="flex-1 border border-zinc-500 hover:border-white text-white font-bold py-2 text-xs">
                                            {t(TEXT_IDS.BTN_CANCEL, language)}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SECRET DEBUG LOGIN */}
                        {(showDebugLogin || isDebugUnlocked) && (
                            <div className="mt-4 border-t border-zinc-800 pt-2 animate-in fade-in">
                                {isDebugUnlocked ? (
                                    <button onClick={() => { toggleDebugUI(true); onClose(); }} className="w-full text-center text-xs font-mono text-green-500 hover:underline">
                                        [OPEN DEBUG CONSOLE]
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="password"
                                            placeholder="ACCESS CODE"
                                            className="flex-1 bg-black border border-zinc-700 text-green-500 font-mono text-xs px-2 outline-none focus:border-green-500"
                                            value={debugPassword}
                                            onChange={(e) => setDebugPassword(e.target.value)}
                                        />
                                        <button onClick={handleDebugLogin} className="bg-zinc-800 text-white px-3 text-xs font-bold border border-zinc-700 hover:bg-green-900">
                                            ENTER
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* VERSION */}
                        <div className="mt-4 text-center">
                            <span className="text-[10px] text-zinc-600 font-mono select-none">v{GAME_VERSION}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
