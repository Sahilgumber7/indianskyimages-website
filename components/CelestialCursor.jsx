"use client";

import { useEffect, useRef } from "react";

export default function CelestialCursor() {
    const cursorRef = useRef(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        let mouseX = 0;
        let mouseY = 0;
        let trailX = 0;
        let trailY = 0;

        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Fast hover check
            const target = e.target;
            const isOverAction = target && (target.closest('button') || target.closest('a') || target.closest('.cursor-pointer'));
            cursor.style.setProperty('--cursor-scale', isOverAction ? '2' : '1');
            cursor.style.setProperty('--trail-scale', isOverAction ? '1.2' : '1');
            cursor.style.setProperty('--cursor-opacity', isOverAction ? '1' : '0.6');
        };

        const updatePosition = () => {
            trailX += (mouseX - trailX) * 0.15;
            trailY += (mouseY - trailY) * 0.15;

            cursor.style.setProperty('--mouse-x', `${mouseX}px`);
            cursor.style.setProperty('--mouse-y', `${mouseY}px`);
            cursor.style.setProperty('--trail-x', `${trailX}px`);
            cursor.style.setProperty('--trail-y', `${trailY}px`);

            requestAnimationFrame(updatePosition);
        };

        window.addEventListener("mousemove", handleMouseMove);
        const animationId = requestAnimationFrame(updatePosition);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            className="fixed inset-0 pointer-events-none z-[9999] hidden lg:block"
            style={{
                '--mouse-x': '0px',
                '--mouse-y': '0px',
                '--trail-x': '0px',
                '--trail-y': '0px',
                '--cursor-scale': '1',
                '--trail-scale': '1',
                '--cursor-opacity': '0.6'
            }}
        >
            {/* Main Pulse - Monochromatic White */}
            <div
                className="absolute top-0 left-0 w-3 h-3 rounded-full bg-white transition-opacity duration-300 will-change-transform shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{
                    opacity: 'var(--cursor-opacity)',
                    transform: `translate3d(calc(var(--mouse-x) - 6px), calc(var(--mouse-y) - 6px), 0) scale(var(--cursor-scale))`,
                    transition: "transform 0.1s ease-out, scale 0.3s ease-out, opacity 0.3s"
                }}
            />

            {/* Ghost Trail - Monochromatic Gray */}
            <div
                className="absolute top-0 left-0 w-6 h-6 rounded-full border border-white/20 blur-[1px] will-change-transform"
                style={{
                    transform: `translate3d(calc(var(--trail-x) - 12px), calc(var(--trail-y) - 12px), 0) scale(var(--trail-scale))`,
                }}
            />

            {/* Atmospheric Glow - Monochromatic Soft White */}
            <div
                className="absolute top-0 left-0 w-24 h-24 rounded-full bg-white/5 blur-[30px] animate-pulse will-change-transform"
                style={{
                    transform: `translate3d(calc(var(--trail-x) - 48px), calc(var(--trail-y) - 48px), 0)`,
                }}
            />
        </div>
    );
}
