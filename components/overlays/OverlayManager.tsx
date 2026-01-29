import React from 'react';
import EventModal from '../EventModal';
import CombatMinigameOverlay from '../CombatMinigameOverlay';
import MenuOverlay from '../MenuOverlay';
import SettingsModal from '../SettingsModal';
import HelpModal from '../HelpModal';
import { EquipmentInventoryView } from '../EquipmentInventoryView';
import { RareResourcesMenu } from '../layout/GameHeader';
import { Language } from '../../types';

interface OverlayManagerProps {
    eventQueue: any[];
    combatMinigame: any;
    isMenuOpen: boolean;
    isSettingsOpen: boolean;
    isHelpOpen: boolean;
    isInventoryOpen: boolean;
    isRareOpen: boolean;
    settings: any;
    lang: Language;
    resources: any;
    discoveredArtifacts: any[];
    onOptionSelect: (optId: string) => void;
    onCompleteMinigame: (res: any) => void;
    onCloseMenu: () => void;
    onCloseSettings: () => void;
    onCloseHelp: () => void;
    onCloseInventory: () => void;
    onCloseRare: () => void;
    onUpdateSettings: (s: any) => void;
    onResetProgress: () => void;
    onSetLanguage: (l: any) => void;
    onOpenSettings: () => void;
    onOpenHelp: () => void;
}

const OverlayManager: React.FC<OverlayManagerProps> = ({
    eventQueue,
    combatMinigame,
    isMenuOpen,
    isSettingsOpen,
    isHelpOpen,
    isInventoryOpen,
    isRareOpen,
    settings,
    lang,
    resources,
    discoveredArtifacts,
    onOptionSelect,
    onCompleteMinigame,
    onCloseMenu,
    onCloseSettings,
    onCloseHelp,
    onCloseInventory,
    onCloseRare,
    onUpdateSettings,
    onResetProgress,
    onSetLanguage,
    onOpenSettings,
    onOpenHelp
}) => {
    return (
        <>
            {combatMinigame && combatMinigame.active && (
                <CombatMinigameOverlay
                    type={combatMinigame.type}
                    difficulty={combatMinigame.difficulty}
                    onComplete={onCompleteMinigame}
                />
            )}

            {eventQueue.length > 0 && (
                <EventModal
                    event={eventQueue[0]}
                    onOptionSelect={onOptionSelect}
                />
            )}

            <MenuOverlay
                isOpen={isMenuOpen}
                onClose={onCloseMenu}
                onOpenSettings={onOpenSettings}
                onOpenHelp={onOpenHelp}
            />

            {isSettingsOpen && (
                <SettingsModal
                    settings={settings}
                    onClose={onCloseSettings}
                    onUpdateSettings={onUpdateSettings}
                    onResetProgress={onResetProgress}
                    language={lang as any}
                    onSetLanguage={onSetLanguage}
                />
            )}

            {isHelpOpen && <HelpModal onClose={onCloseHelp} />}

            {isInventoryOpen && <EquipmentInventoryView onClose={onCloseInventory} />}

            <RareResourcesMenu
                isOpen={isRareOpen}
                onClose={onCloseRare}
                resources={resources}
                lang={lang}
            />
        </>
    );
};

export default OverlayManager;
