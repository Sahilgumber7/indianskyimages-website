"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Header from "./_components/header";

// Dynamically import MapView (disable SSR)
const MapView = dynamic(() => import("./_components/mapView"), { ssr: false });


export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="relative">
      {/* Header + Upload Button */}
      <Header isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />

      {/* Fullscreen Map - Blurred when dialog is open */}
      <div className={`relative w-full h-screen  ${isDialogOpen ? "blur-sm" : ""}`}>
        <MapView />
      </div>
    </div>
  );
}
