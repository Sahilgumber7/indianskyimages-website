"use client";
import { useState } from "react";
import Header from "./_components/header";
import SkyImageMap from "./_components/mapView";

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="relative">
      {/* Header + Upload Button */}
      <Header isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />

      {/* Fullscreen Map - Blurred when dialog is open */}
      <div className={`relative w-full h-screen  ${isDialogOpen ? "blur-sm" : ""}`}>
        <SkyImageMap />
      </div>
    </div>
  );
}
