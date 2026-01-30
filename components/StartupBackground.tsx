
import React, { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Texture, Sprite } from 'pixi.js';

/**
 * StartupBackground - легкий анимированный фон для начального экрана.
 * Использует отдельный инстанс PixiJS, который уничтожается при размонтировании.
 */
export const StartupBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let app: Application | null = null;
        let isDestroyed = false;

        const initPixi = async () => {
            app = new Application();
            try {
                await app.init({
                    backgroundAlpha: 0,
                    antialias: false,
                    resolution: Math.min(window.devicePixelRatio || 1, 2),
                    autoDensity: true,
                    preference: 'webgl',
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            } catch (e) {
                console.warn("Startup Pixi Init Warning:", e);
                return;
            }

            if (isDestroyed || !containerRef.current) {
                if (app.renderer) {
                    app.destroy(true, { children: true, texture: true });
                }
                return;
            }

            containerRef.current.appendChild(app.canvas);

            const starContainer = new Container();
            app.stage.addChild(starContainer);

            // Создаем текстуру звезды один раз
            const graphics = new Graphics();
            graphics.circle(0, 0, 2);
            graphics.fill(0xffffff);
            const starTexture = app.renderer.generateTexture(graphics);
            graphics.destroy();

            const stars: { sprite: Sprite; speed: number; phase: number }[] = [];
            const starCount = window.innerWidth < 768 ? 40 : 100;

            for (let i = 0; i < starCount; i++) {
                const star = new Sprite(starTexture);
                star.anchor.set(0.5);
                star.x = Math.random() * app.screen.width;
                star.y = Math.random() * app.screen.height;
                star.alpha = Math.random() * 0.5 + 0.1;
                const size = Math.random() * 0.8 + 0.2;
                star.scale.set(size);

                starContainer.addChild(star);
                stars.push({
                    sprite: star,
                    speed: (Math.random() * 0.2 + 0.05) * size,
                    phase: Math.random() * Math.PI * 2
                });
            }

            app.ticker.add((ticker) => {
                const dt = ticker.deltaTime;
                const time = performance.now() / 1000;

                stars.forEach((s, i) => {
                    s.sprite.y -= s.speed * dt;
                    // Легкое мерцание
                    s.sprite.alpha = (Math.sin(time + s.phase) * 0.2 + 0.4) * s.sprite.scale.x;

                    if (s.sprite.y < -10) {
                        s.sprite.y = app!.screen.height + 10;
                        s.sprite.x = Math.random() * app!.screen.width;
                    }
                });
            });

            const handleResize = () => {
                if (app && app.renderer) {
                    app.renderer.resize(window.innerWidth, window.innerHeight);
                }
            };
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
            };
        };

        initPixi();

        return () => {
            isDestroyed = true;
            if (app) {
                // В PixiJS v8 destroy() может упасть, если рендерер еще не инициализирован
                if (app.renderer) {
                    app.destroy(true, { children: true, texture: true });
                } else {
                    // Если рендерера нет, просто останавливаем тикер если он есть
                    app.ticker?.stop();
                }
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-0 bg-void pointer-events-none opacity-60"
        />
    );
};
