"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Header from "../components/header";
import { useTheme } from "next-themes";

// Dynamically import with SSR disabled
const MapView = dynamic(() => import("../components/mapView"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-black">
      <div className="w-10 h-10 border border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin" />
    </div>
  ),
});
const GlobeView = dynamic(() => import("../components/GlobeView"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-black">
      <div className="w-10 h-10 border border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin" />
    </div>
  ),
});

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGlobeView, setIsGlobeView] = useState(false);
  const { resolvedTheme } = useTheme();

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
