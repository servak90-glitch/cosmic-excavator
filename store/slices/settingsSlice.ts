/**
 * SettingsSlice — настройки и отладка
 */

import { SliceCreator } from './types';
import { GameSettings, View } from '../../types';
import { audioEngine } from '../../services/audioEngine';

export interface SettingsActions {
    setView: (view: View) => void;
    setLanguage: (lang: 'RU' | 'EN') => void;
    updateSettings: (settings: Partial<GameSettings>) => void;
    selectBiome: (biomeName: string | null) => void;
    setDebugUnlocked: (unlocked: boolean) => void;
    toggleDebugUI: (isOpen: boolean) => void;
}

export const createSettingsSlice: SliceCreator<SettingsActions> = (set, get) => ({
    setView: (view) => set({ activeView: view }),

    setLanguage: (lang) => set(s => ({
        settings: { ...s.settings, language: lang }
    })),

    updateSettings: (newSettings) => set(s => {
        const next = { ...s.settings, ...newSettings };
        audioEngine.setMusicVolume(next.musicMuted ? 0 : next.musicVolume);
        audioEngine.setSfxVolume(next.sfxMuted ? 0 : next.sfxVolume);
        audioEngine.setDrillVolume(next.drillMuted ? 0 : next.drillVolume);
        return { settings: next };
    }),

    selectBiome: (biomeName) => set({ selectedBiome: biomeName }),

    setDebugUnlocked: (unlocked) => set({ debugUnlocked: unlocked }),

    toggleDebugUI: (isOpen) => set({ isDebugUIOpen: isOpen }),
});
