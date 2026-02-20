"use client";

import { Suspense, useState } from "react";
import Gallery from "../../components/Gallery";
import Header from "../../components/header";
import SiteFooter from "../../components/SiteFooter";

export default function GalleryPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGlobeView, setIsGlobeView] = useState(false);

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
        <Suspense
          fallback={
            <div className="min-h-[40vh] flex items-center justify-center">
              <div className="w-10 h-10 border border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin" />
            </div>
          }
        >
          <Gallery />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
