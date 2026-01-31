import React from 'react';
import { View, Language } from '../../types';
import ForgeView from '../ForgeView';
import CityView from '../CityView';
import SkillsView from '../SkillsView';
import CodexView from '../CodexView';
import { GlobalMapView } from '../GlobalMapView';

interface NavigationManagerProps {
    activeView: View;
    lang: string;
    // Props for specific views (to be refined)
    currentBiome: any;
    resources: any;
    heat: number;
    integrity: number;
    maxIntegrity: number;
    xp: number;
    depth: number;
    discoveredArtifacts: any[];
    onTrade: any;
    onHeal: any;
    onRepair: any;
}

const NavigationManager: React.FC<NavigationManagerProps> = ({
    activeView,
    lang,
    currentBiome,
    resources,
    heat,
    integrity,
    maxIntegrity,
    xp,
    depth,
    discoveredArtifacts,
    onTrade,
    onHeal,
    onRepair
}) => {
    const isNavOpen = activeView !== View.DRILL && activeView !== View.COMBAT;

    if (!isNavOpen) return null;

    return (
        <div key={activeView} className="w-full h-full animate-fadeIn pointer-events-auto">
            {activeView === View.CITY && (
                <CityView
                    biome={currentBiome}
                    resources={resources}
                    heat={heat}
                    integrity={integrity}
                    maxIntegrity={maxIntegrity}
                    xp={xp}
                    depth={depth}
                    onTrade={onTrade}
                    onHeal={onHeal}
                    onRepair={onRepair}
                />
            )}
            {activeView === View.FORGE && <ForgeView />}
            {activeView === View.SKILLS && <SkillsView />}
            {activeView === View.CODEX && <CodexView discoveredArtifacts={discoveredArtifacts} />}
            {activeView === View.GLOBAL_MAP && <GlobalMapView />}
        </div>
    );
};

export default NavigationManager;
