import React, { useEffect, useState } from 'react';

interface PredictionAlertProps {
    eventTitle: string;
    eventType: string;
    timeRemaining: number;
    detailLevel: 'BASIC' | 'MEDIUM' | 'FULL';
    onDismiss: () => void;
}

export const PredictionAlert: React.FC<PredictionAlertProps> = ({
    eventTitle,
    eventType,
    timeRemaining,
    detailLevel,
    onDismiss
}) => {
    const [countdown, setCountdown] = useState(timeRemaining);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onDismiss();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [onDismiss]);

    // Иконка по типу события
    const getIcon = () => {
        if (eventType.includes('raid')) return '🚨';
        if (eventType.includes('discovery')) return '🔍';
        if (eventType.includes('hazard')) return '⚠️';
        if (eventType.includes('fuel')) return '⛽';
        if (eventType.includes('artifact')) return '💎';
        return '📡';
    };

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-slideDown">
            <div className="bg-purple-900/90 border-2 border-purple-500 px-6 py-4 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.5)] backdrop-blur-sm min-w-[300px]">
                <div className="flex items-center gap-4">
                    <span className="text-4xl">{getIcon()}</span>
                    <div className="flex-1">
                        <div className="text-purple-300 text-xs font-bold mb-1 pixel-text">ПРЕДСКАЗАНИЕ</div>

                        {/* BASIC: только название */}
                        {detailLevel === 'BASIC' && (
                            <div className="text-white font-bold">Событие через {countdown}с</div>
                        )}

                        {/* MEDIUM: название + тип */}
                        {detailLevel === 'MEDIUM' && (
                            <>
                                <div className="text-white font-bold">{eventTitle}</div>
                                <div className="text-purple-300 text-sm">через {countdown}с</div>
                            </>
                        )}

                        {/* FULL: полная информация */}
                        {detailLevel === 'FULL' && (
                            <>
                                <div className="text-white font-bold text-lg">{eventTitle}</div>
                                <div className="text-purple-300 text-sm">Тип: {eventType}</div>
                                <div className="text-yellow-400 font-mono text-xl mt-1">
                                    {countdown}с до события
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1 bg-purple-950 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-purple-400 transition-all duration-1000"
                        style={{ width: `${(countdown / timeRemaining) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
