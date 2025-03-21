"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "./_components/header";

// Dynamically import MapView (disable SSR)
const MapView = dynamic(() => import("./_components/mapView"), { ssr: false });

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setDarkMode(storedTheme === "dark");
    }
  }, []);

  return (
    <div className={`${darkMode ? "dark" : ""} relative bg-white dark:bg-gray-900 min-h-screen transition`}>
      {/* Header + Upload Button */}
      <Header 
        isDialogOpen={isDialogOpen} 
        setIsDialogOpen={setIsDialogOpen} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />

      {/* Fullscreen Map - Blurred when dialog is open */}
      <div className={`relative w-full h-screen transition ${isDialogOpen ? "blur-sm" : ""}`}>
        <MapView darkMode={darkMode} />
      </div>
    </div>
  );
}


