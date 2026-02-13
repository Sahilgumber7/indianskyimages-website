"use client";

import { useEffect, useMemo, useState } from "react";

export default function SkyPulse() {
  const [phase, setPhase] = useState("night");
  const [mounted, setMounted] = useState(false);

  const stars = useMemo(
    () =>
      Array.from({ length: 30 }).map(() => ({
        size: Math.random() * 1.5 + 1,
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
      })),
    []
  );

  useEffect(() => {
    setMounted(true);

    const updatePhase = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 7) setPhase("dawn");
      else if (hour >= 7 && hour < 17) setPhase("day");
      else if (hour >= 17 && hour < 19) setPhase("dusk");
      else setPhase("night");
    };

    updatePhase();
    const interval = setInterval(updatePhase, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const backgrounds = {
    dawn: "from-gray-200/10 via-gray-300/5 to-transparent",
    day: "from-white/5 via-gray-200/5 to-transparent",
    dusk: "from-gray-600/10 via-gray-500/5 to-transparent",
    night: "from-black via-gray-900/40 to-transparent",
  };

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-black transition-colors duration-[3000ms]">
      <div
        className={`absolute -top-[20%] -left-[10%] w-[120%] h-[120%] transition-all duration-[3000ms] ${backgrounds[phase]}`}
        style={{
          background: `radial-gradient(circle at 20% 30%, var(--tw-gradient-from), var(--tw-gradient-to))`,
        }}
      />

      <div className="absolute inset-0 opacity-20 transition-opacity duration-1000">
        <div className="absolute top-[15%] left-[15%] w-[450px] h-[450px] bg-white/5 rounded-full blur-[130px] motion-safe:animate-pulse" />
        <div
          className="absolute bottom-[20%] right-[10%] w-[550px] h-[550px] bg-gray-500/5 rounded-full blur-[160px] motion-safe:animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {phase === "night" && (
        <div className="absolute inset-0 animate-in fade-in duration-1000">
          {stars.map((star, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full opacity-30 motion-safe:animate-pulse will-change-[opacity]"
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                top: `${star.top}%`,
                left: `${star.left}%`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

