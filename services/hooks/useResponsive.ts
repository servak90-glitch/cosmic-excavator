/**
 * useResponsive.ts
 * Централизованная система responsive hooks для адаптивной верстки
 * Создано: 2026-01-20
 */

import { useState, useEffect, useCallback } from 'react';

// Breakpoints (Mobile-first)
export const BREAKPOINTS = {
    xs: 320,   // Маленькие телефоны
    sm: 480,   // Телефоны
    md: 768,   // Планшеты
    lg: 1024,  // Десктоп
    xl: 1280   // Большие экраны
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Базовый хук для отслеживания media query
 * @param query - CSS media query строка (например, '(min-width: 768px)')
 * @returns boolean - соответствует ли текущий viewport запросу
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);
        setMatches(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setMatches(e.matches);
        };

        // Современный API
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            // Fallback для старых браузеров
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
        }
    }, [query]);

    return matches;
}

/**
 * Хук с готовыми breakpoints для быстрого использования
 * @returns объект с флагами для каждого breakpoint
 */
export function useResponsive() {
    const isXs = useMediaQuery(`(max-width: ${BREAKPOINTS.sm - 1}px)`);
    const isSm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`);
    const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`);
    const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px) and (max-width: ${BREAKPOINTS.xl - 1}px)`);
    const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);

    // Удобные алиасы
    const isMobile = isXs || isSm;           // < 768px
    const isTablet = isMd;                    // 768px - 1023px
    const isDesktop = isLg || isXl;           // >= 1024px
    const isTouchDevice = isMobile || isTablet; // < 1024px

    // Текущий breakpoint
    const breakpoint: BreakpointKey = isXl ? 'xl' : isLg ? 'lg' : isMd ? 'md' : isSm ? 'sm' : 'xs';

    return {
        // Точные breakpoints
        isXs,
        isSm,
        isMd,
        isLg,
        isXl,
        // Удобные группы
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        // Текущий breakpoint
        breakpoint
    };
}

/**
 * Хук для отслеживания размеров экрана и ориентации
 * @returns объект с размерами и ориентацией
 */
export function useScreenDimensions() {
    const [dimensions, setDimensions] = useState(() => ({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768,
        orientation: typeof window !== 'undefined'
            ? (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait') as 'landscape' | 'portrait'
            : 'portrait' as const
    }));

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
                orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
            });
        };

        window.addEventListener('resize', handleResize);
        // Также слушаем изменение ориентации на мобильных
        window.addEventListener('orientationchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    return dimensions;
}

/**
 * Хук для определения безопасных зон (Safe Area) на устройствах с вырезами
 * @returns объект с отступами safe area
 */
export function useSafeArea() {
    const [safeArea, setSafeArea] = useState({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updateSafeArea = () => {
            const computedStyle = getComputedStyle(document.documentElement);
            setSafeArea({
                top: parseInt(computedStyle.getPropertyValue('--sat') || '0', 10) ||
                    parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
                right: parseInt(computedStyle.getPropertyValue('--sar') || '0', 10) ||
                    parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
                bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0', 10) ||
                    parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
                left: parseInt(computedStyle.getPropertyValue('--sal') || '0', 10) ||
                    parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0', 10)
            });
        };

        updateSafeArea();
        window.addEventListener('resize', updateSafeArea);
        return () => window.removeEventListener('resize', updateSafeArea);
    }, []);

    return safeArea;
}

/**
 * Утилита для получения responsive значения на основе текущего breakpoint
 * @param values - объект с значениями для каждого breakpoint
 * @param breakpoint - текущий breakpoint
 * @returns значение для текущего breakpoint (или ближайшего меньшего)
 */
export function getResponsiveValue<T>(
    values: Partial<Record<BreakpointKey, T>>,
    breakpoint: BreakpointKey
): T | undefined {
    const order: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    const currentIndex = order.indexOf(breakpoint);

    // Ищем значение от текущего breakpoint вниз
    for (let i = currentIndex; i >= 0; i--) {
        const key = order[i];
        if (values[key] !== undefined) {
            return values[key];
        }
    }

    return undefined;
}
