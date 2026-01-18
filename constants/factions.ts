import { FactionId, FactionDef } from '../types';

export const REPUTATION_TIERS = [
    { level: 1, min: 0, name: 'Neutral' },
    { level: 2, min: 100, name: 'Associate' },
    { level: 3, min: 300, name: 'Contractor' }, // Perk 1
    { level: 4, min: 600, name: 'Partner' },
    { level: 5, min: 1000, name: 'Ally' },      // Perk 2
    { level: 6, min: 1500, name: 'Insider' },
    { level: 7, min: 2500, name: 'Executive' }, // Perk 3
    { level: 8, min: 4000, name: 'Council' },
    { level: 9, min: 6000, name: 'Leader' },
    { level: 10, min: 10000, name: 'Legend' }   // Perk 4
];

export const FACTIONS: Record<FactionId, FactionDef> = {
    CORPORATE: {
        id: 'CORPORATE',
        name: 'Void Industries',
        description: 'Mega-corporation controlling logistics and mining rights.',
        perks: [
            {
                id: 'CORP_EXCHANGE',
                levelRequired: 3,
                name: 'Corporate Exchange',
                description: 'Market prices reduced by 5%',
                effectType: 'MARKET',
                value: 0.05
            },
            {
                id: 'BULK_LOGISTICS',
                levelRequired: 5,
                name: 'Bulk Logistics',
                description: 'Caravan capacity increased by 20%',
                effectType: 'LOGISTICS',
                value: 0.2
            },
            {
                id: 'INSURANCE',
                levelRequired: 7,
                name: 'Cargo Insurance',
                description: 'Caravan loss risk reduced by 50%',
                effectType: 'LOGISTICS',
                value: 0.5
            },
            {
                id: 'EXECUTIVE',
                levelRequired: 10,
                name: 'Executive Access',
                description: 'Passive resource generation x2',
                effectType: 'PASSIVE',
                value: 2.0
            }
        ]
    },
    SCIENCE: {
        id: 'SCIENCE',
        name: 'Aegis Collegium',
        description: 'Scientific order studying the Void and ancient artifacts.',
        perks: [
            {
                id: 'RESEARCH_GRANT',
                levelRequired: 3,
                name: 'Research Grants',
                description: 'Artifact sell value +10%',
                effectType: 'PASSIVE',
                value: 0.1
            },
            {
                id: 'AUTO_ANALYSIS',
                levelRequired: 5,
                name: 'Auto-Analysis',
                description: 'Artifact analysis time reduced by 25%',
                effectType: 'PASSIVE',
                value: 0.25
            },
            {
                id: 'ANOMALY_SCANNER',
                levelRequired: 7,
                name: 'Anomaly Scanner',
                description: 'Reveals risk levels in Side Tunnels',
                effectType: 'SCANNER'
            },
            {
                id: 'QUANTUM_STABILITY',
                levelRequired: 10,
                name: 'Quantum Stability',
                description: 'Tectonic events frequency reduced by 50%',
                effectType: 'PASSIVE',
                value: 0.5
            }
        ]
    },
    REBELS: {
        id: 'REBELS',
        name: 'Free Miners',
        description: 'Independent miners fighting for freedom from corporate control.',
        perks: [
            {
                id: 'BLACK_MARKET',
                levelRequired: 3,
                name: 'Black Market Access',
                description: 'Unlocks trading illegal goods',
                effectType: 'MARKET'
            },
            {
                id: 'SMUGGLER',
                levelRequired: 5,
                name: 'Smuggler Routes',
                description: 'Travel fuel consumption reduced by 20%',
                effectType: 'LOGISTICS',
                value: 0.2
            },
            {
                id: 'SABOTAGE',
                levelRequired: 7,
                name: 'Sabotage Expertise',
                description: 'Risky Tunnel success chance +10%',
                effectType: 'PASSIVE',
                value: 0.1
            },
            {
                id: 'LIBERATION',
                levelRequired: 10,
                name: 'Liberation Hero',
                description: 'Base defense effectiveness +50%',
                effectType: 'COMBAT',
                value: 0.5
            }
        ]
    }
};
