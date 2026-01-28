import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RegionId } from '../../types';
import { REGIONS } from '../../constants/regions';
import { t } from '../../services/localization';
import { useGameStore } from '../../store/gameStore';
import { MapPin, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface InteractiveWorldMapProps {
    activeRegion: RegionId;
    onRegionSelect: (id: RegionId) => void;
}

// Координаты регионов на карте (в процентах от размера изображения)
const REGION_MARKERS: Record<RegionId, { x: number; y: number }> = {
    [RegionId.RUST_VALLEY]: { x: 15, y: 30 },
    [RegionId.CRYSTAL_WASTES]: { x: 45, y: 20 },
    [RegionId.IRON_GATES]: { x: 50, y: 65 },
    [RegionId.MAGMA_CORE]: { x: 85, y: 20 },
    [RegionId.VOID_CHASM]: { x: 85, y: 70 }
};

export const InteractiveWorldMap: React.FC<InteractiveWorldMapProps> = ({
    activeRegion,
    onRegionSelect
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const lang = useGameStore(s => s.settings.language);

    // State для pan/zoom
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hoveredRegion, setHoveredRegion] = useState<RegionId | null>(null);

    // Ограничения зума
    const MIN_SCALE = 0.5;
    const MAX_SCALE = 3;

    // Обработка колеса мыши для зума
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(prev => Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev * delta)));
    }, []);

    // Начало перетаскивания
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.region-marker')) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }, [position]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if ((e.target as HTMLElement).closest('.region-marker')) return;
        if (e.touches.length === 1) {
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y
            });
        }
    }, [position]);

    // Перетаскивание
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    }, [isDragging, dragStart]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        e.preventDefault();
        setPosition({
            x: e.touches[0].clientX - dragStart.x,
            y: e.touches[0].clientY - dragStart.y
        });
    }, [isDragging, dragStart]);

    // Конец перетаскивания
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Pinch-to-zoom для мобильных
    const lastTouchDistance = useRef<number>(0);
    const handleTouchMoveZoom = useCallback((e: TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            if (lastTouchDistance.current > 0) {
                const delta = distance / lastTouchDistance.current;
                setScale(prev => Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev * delta)));
            }

            lastTouchDistance.current = distance;
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        lastTouchDistance.current = 0;
    }, []);

    // Подписка на события
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('wheel', handleWheel, { passive: false });
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchmove', handleTouchMoveZoom, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('wheel', handleWheel);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchmove', handleTouchMoveZoom);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleWheel, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchMoveZoom, handleTouchEnd]);

    // Кнопки управления зумом
    const zoomIn = () => setScale(prev => Math.min(MAX_SCALE, prev * 1.2));
    const zoomOut = () => setScale(prev => Math.max(MIN_SCALE, prev / 1.2));
    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden bg-black/60 rounded-lg"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            {/* Карта */}
            <div
                ref={mapRef}
                className="w-full h-full flex items-center justify-center transition-transform duration-100"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: 'center center'
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                {/* Контейнер изображения и маркеров */}
                <div className="relative w-full">
                    {/* Изображение карты */}
                    <img
                        src="/assets/world-map.jpg"
                        alt="World Map"
                        className="w-full h-auto object-cover pointer-events-none select-none"
                        style={{ aspectRatio: '1024/576' }}
                        draggable={false}
                    />

                    {/* Маркеры регионов */}
                    {Object.entries(REGION_MARKERS).map(([regionId, coords]) => {
                        const region = REGIONS[regionId as RegionId];
                        const isActive = regionId === activeRegion;
                        const isHovered = regionId === hoveredRegion;

                        return (
                            <button
                                key={regionId}
                                className="region-marker absolute transform -translate-x-1/2 -translate-y-1/2 group"
                                style={{
                                    left: `${coords.x}%`,
                                    top: `${coords.y}%`,
                                    pointerEvents: 'auto'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRegionSelect(regionId as RegionId);
                                }}
                                onMouseEnter={() => setHoveredRegion(regionId as RegionId)}
                                onMouseLeave={() => setHoveredRegion(null)}
                            >
                                {/* Пульсирующая точка */}
                                <div className="relative">
                                    <div
                                        className={`w-4 h-4 md:w-6 md:h-6 rounded-full transition-all duration-300 ${isActive
                                            ? 'bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]'
                                            : 'bg-white/60 group-hover:bg-cyan-400 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]'
                                            }`}
                                    />
                                    {isActive && (
                                        <div className="absolute inset-0 w-4 h-4 md:w-6 md:h-6 rounded-full bg-cyan-400 animate-ping opacity-75" />
                                    )}
                                    <MapPin
                                        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 transition-colors ${isActive ? 'text-black' : 'text-black/60 group-hover:text-black'
                                            }`}
                                    />
                                </div>

                                {/* Название региона при наведении */}
                                {(isHovered || isActive) && (
                                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none">
                                        <div className="glass-panel px-3 py-1.5 border-cyan-500/30 bg-black/90">
                                            <span className="text-[10px] md:text-xs font-black text-cyan-400 uppercase tracking-wider">
                                                {t(region.name, lang)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Элементы управления */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
                <button
                    onClick={zoomIn}
                    className="glass-panel p-2 md:p-3 bg-black/60 border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all group"
                    title="Приблизить"
                >
                    <ZoomIn className="w-4 h-4 md:w-5 md:h-5 text-white/60 group-hover:text-cyan-400" />
                </button>
                <button
                    onClick={zoomOut}
                    className="glass-panel p-2 md:p-3 bg-black/60 border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all group"
                    title="Отдалить"
                >
                    <ZoomOut className="w-4 h-4 md:w-5 md:h-5 text-white/60 group-hover:text-cyan-400" />
                </button>
                <button
                    onClick={resetZoom}
                    className="glass-panel p-2 md:p-3 bg-black/60 border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all group"
                    title="Сбросить"
                >
                    <Maximize2 className="w-4 h-4 md:w-5 md:h-5 text-white/60 group-hover:text-cyan-400" />
                </button>
            </div>

            {/* Подсказка */}
            <div className="absolute top-4 left-4 glass-panel px-3 py-2 border-white/10 bg-black/60 z-20">
                <span className="text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-widest">
                    {lang === 'RU' ? 'Перетащите для перемещения • Колесо/Pinch для зума' : 'Drag to move • Wheel/Pinch to zoom'}
                </span>
            </div>
        </div>
    );
};
