"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Gallery from "../../components/Gallery";
import Header from "../../components/header";

export default function GalleryPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGlobeView, setIsGlobeView] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-700">
      {/* Header */}
      <Header
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isGlobeView={isGlobeView}
        setIsGlobeView={setIsGlobeView}
      />

      {/* Gallery Content */}
      <main
        className={`relative w-full transition-all duration-700 ${isDialogOpen ? "blur-xl" : ""}`}
      >
        <Gallery />
      </main>
    </div>
  );
}
