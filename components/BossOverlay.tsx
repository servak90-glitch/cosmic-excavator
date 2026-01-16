
import React from 'react';
import { useGameStore } from '../store/gameStore';
import { WeakPoint } from '../types';

interface BossOverlayProps {
    onWeakPointClick: (wpId: string) => void;
}

const BossOverlay: React.FC<BossOverlayProps> = ({ onWeakPointClick }) => {
    const currentBoss = useGameStore(s => s.currentBoss);

    if (!currentBoss || !currentBoss.weakPoints) return null;

    // Canvas center approximation (assuming centered boss)
    // In BossRenderer: cx = w/2, cy = h*0.4 (+50 offset for some types)
    // We need to match this relative positioning.
    // Ideally, we'd pass these coords, but for now we'll center relative to container.

    return (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
            {/* Center Reference Point */}
            <div className="absolute top-[40%] left-1/2 w-0 h-0">
                {currentBoss.weakPoints.map((wp: WeakPoint) => {
                    if (!wp.isActive) return null;

                    // Convert percentage offset to pixels roughly or use %
                    // x,y are percentages relative to boss center.
                    // Let's assume 1% = 2px for visual scale approximation or utilize percentages directly if container is sized.
                    // Better approach: use translate with pixels if x/y are pixels, or % if percents.
                    // BossRegistry defined x/y as numbers (e.g. -30, 20). Let's treat them as percentages of a standard 200x200 boss box?
                    // "x: -30" in registry likely meant pixels offset from center in Canvas.

                    const style: React.CSSProperties = {
                        transform: `translate(${wp.x * 2.5}px, ${wp.y * 2.5}px)`, // Scaling for visibility
                        width: `${wp.radius * 2}px`,
                        height: `${wp.radius * 2}px`,
                        marginTop: `-${wp.radius}px`,
                        marginLeft: `-${wp.radius}px`,
                    };

                    return (
                        <button
                            key={wp.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onWeakPointClick(wp.id);
                            }}
                            style={style}
                            className="absolute pointer-events-auto rounded-full border-2 border-red-500 bg-red-900/40 animate-pulse hover:bg-red-500/60 transition-colors cursor-crosshair group"
                        >
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-red-400 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                                WEAK POINT
                            </span>
                            {/* Target Reticle */}
                            <div className="absolute inset-0 border border-red-400 rounded-full scale-150 opacity-50 animate-ping" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BossOverlay;
