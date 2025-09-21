"use client";

import { useState, useEffect } from "react";
import Gallery from "../../components/Gallery";
import Header from "../../components/header";

export default function GalleryPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isGlobeView, setIsGlobeView] = useState(false);

  // Load dark mode from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) setDarkMode(storedTheme === "dark");
  }, []);

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-screen bg-gray-50 dark:bg-gray-900 transition`}>
      {/* Header */}
      <Header
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isGlobeView={isGlobeView}
        setIsGlobeView={setIsGlobeView}
      />

      {/* Gallery Content with top padding */}
      <main
        className={`relative w-full transition  ${isDialogOpen ? "blur-sm" : ""}`}
      >
        <Gallery darkMode={darkMode} />
      </main>
    </div>
  );
}
