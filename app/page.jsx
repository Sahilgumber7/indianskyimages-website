"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "../components/header";

// Dynamically import with SSR disabled
const MapView = dynamic(() => import("../components/MapView"), { ssr: false });
const GlobeView = dynamic(() => import("../components/GlobeView"), { ssr: false });

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isGlobeView, setIsGlobeView] = useState(false);

  // Load dark mode from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) setDarkMode(storedTheme === "dark");
  }, []);

  return (
    <div className={`${darkMode ? "dark" : ""} relative bg-white dark:bg-gray-900 min-h-screen transition`}>
      <Header
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isGlobeView={isGlobeView}
        setIsGlobeView={setIsGlobeView}
      />

      <div className={`relative w-full h-screen transition ${isDialogOpen ? "blur-sm" : ""}`}>
        {isGlobeView ? <GlobeView /> : <MapView darkMode={darkMode} />}
      </div>
    </div>
  );
}
