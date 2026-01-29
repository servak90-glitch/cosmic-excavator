import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArtifactDefinition } from '../types';
import { t, TL } from '../services/localization';

interface ArtifactTooltipProps {
    artifact: ArtifactDefinition;
    isIdentified: boolean;
    isAnalyzing: boolean;
    targetRef: React.RefObject<HTMLElement>;
    lang: 'RU' | 'EN';
    colorScheme?: 'cyan' | 'green';
}

export const ArtifactTooltip: React.FC<ArtifactTooltipProps> = ({
    artifact,
    isIdentified,
    isAnalyzing,
    targetRef,
    lang,
    colorScheme = 'cyan'
}) => {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const touchTimer = useRef<number | null>(null);

    useEffect(() => {
        const updatePosition = () => {
            if (targetRef.current && tooltipRef.current) {
                const rect = targetRef.current.getBoundingClientRect();
                const tooltipRect = tooltipRef.current.getBoundingClientRect();

                let top = rect.top - tooltipRect.height - 8;
                let left = rect.left + rect.width / 2 - tooltipRect.width / 2;

                if (top < 10) {
                    top = rect.bottom + 8;
                }

                if (left < 10) {
                    left = 10;
                } else if (left + tooltipRect.width > window.innerWidth - 10) {
                    left = window.innerWidth - tooltipRect.width - 10;
                }

                setPosition({ top, left });
            }
        };

        const handleShow = () => {
            setIsVisible(true);
            // Используем таймаут, чтобы дать DOM обновиться перед расчетом позиции
            setTimeout(updatePosition, 0);
        };

        const handleHide = () => {
            setIsVisible(false);
        };

        // Long Press для мобильных
        const handleTouchStart = (e: TouchEvent) => {
            // Предотвращаем срабатывание, если уже есть активный таймер
            if (touchTimer.current) clearTimeout(touchTimer.current);

            touchTimer.current = window.setTimeout(() => {
                handleShow();
                touchTimer.current = null;
            }, 500); // 500мс для лонг-пресса
        };

        const handleTouchEnd = () => {
            if (touchTimer.current) {
                clearTimeout(touchTimer.current);
                touchTimer.current = null;
            }
        };

        const handleGlobalTouch = (e: MouseEvent | TouchEvent) => {
            if (isVisible && tooltipRef.current && !tooltipRef.current.contains(e.target as Node) &&
                targetRef.current && !targetRef.current.contains(e.target as Node)) {
                handleHide();
            }
        };

        const target = targetRef.current;
        if (target) {
            target.addEventListener('mouseenter', handleShow);
            target.addEventListener('mouseleave', handleHide);
            target.addEventListener('touchstart', handleTouchStart, { passive: true });
            target.addEventListener('touchend', handleTouchEnd);
            target.addEventListener('touchmove', handleTouchEnd);

            window.addEventListener('scroll', updatePosition);
            window.addEventListener('resize', updatePosition);
            window.addEventListener('mousedown', handleGlobalTouch);
            window.addEventListener('touchstart', handleGlobalTouch);
        }

        return () => {
            if (target) {
                target.removeEventListener('mouseenter', handleShow);
                target.removeEventListener('mouseleave', handleHide);
                target.removeEventListener('touchstart', handleTouchStart);
                target.removeEventListener('touchend', handleTouchEnd);
                target.removeEventListener('touchmove', handleTouchEnd);
            }
            if (touchTimer.current) clearTimeout(touchTimer.current);
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('mousedown', handleGlobalTouch);
            window.removeEventListener('touchstart', handleGlobalTouch);
        };
    }, [targetRef, isVisible]);

    if (!isVisible) return null;

    const borderColor = colorScheme === 'cyan' ? 'border-cyan-500/50' : 'border-green-500/50';
    const shadowColor = colorScheme === 'cyan'
        ? 'shadow-[0_0_20px_rgba(6,182,212,0.4)]'
        : 'shadow-[0_0_20px_rgba(34,197,94,0.4)]';
    const titleColor = colorScheme === 'cyan' ? 'text-cyan-400' : 'text-green-400';
    const borderTopColor = colorScheme === 'cyan' ? 'border-cyan-800/50' : 'border-green-800/50';

    return createPortal(
        <div
            ref={tooltipRef}
            className={`fixed z-[99999] w-64 bg-black/95 backdrop-blur-sm border-2 ${borderColor} p-3 rounded-lg ${shadowColor} pointer-events-none`}
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
            {isIdentified ? (
                <>
                    <p className={`text-xs font-bold ${titleColor} mb-2 uppercase tracking-wide`}>
                        {t(artifact.name, lang)}
                    </p>
                    <p className="text-[10px] text-gray-300 italic mb-2 leading-relaxed">
                        "{t(artifact.loreDescription, lang)}"
                    </p>
                    <div className={`border-t ${borderTopColor} pt-2 text-[10px] text-cyan-400 font-bold leading-relaxed`}>
                        {t(artifact.effectDescription, lang)}
                    </div>
                </>
            ) : (
                <p className="text-[10px] text-zinc-400 italic">
                    {isAnalyzing ? t(TL.ui.analyzing, lang) : t(TL.ui.analysisRequired, lang)}
                </p>
            )}
        </div>,
        document.body
    );
};
