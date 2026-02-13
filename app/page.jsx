"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "../components/header";
import { useTheme } from "next-themes";

// Dynamically import with SSR disabled
const MapView = dynamic(() => import("../components/mapView"), { ssr: false });
const GlobeView = dynamic(() => import("../components/GlobeView"), { ssr: false });

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGlobeView, setIsGlobeView] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative bg-white dark:bg-black min-h-screen transition-colors duration-700">
      <Header
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isGlobeView={isGlobeView}
        setIsGlobeView={setIsGlobeView}
      />

      <div className={`relative w-full h-screen transition-all duration-700 ${isDialogOpen ? "blur-xl" : ""}`}>
        {isGlobeView ? <GlobeView /> : <MapView darkMode={isDark} />}
      </div>
    </div>
  );
}
