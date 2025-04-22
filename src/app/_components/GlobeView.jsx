"use client";

import { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";
import { supabase } from "@/lib/supabase";

export default function GlobeView() {
  const globeRef = useRef();
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function fetchImages() {
      const { data, error } = await supabase.from("images").select("*");
      if (error || !data) return;

      setImages(data);
    }
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      const globe = Globe()(globeRef.current)
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
        .pointLat((d) => d.latitude)
        .pointLng((d) => d.longitude)
        .pointAltitude(() => 0.01)  // To lift the markers slightly off the surface
        .pointColor(() => "#ffffff") // Color for the marker
        .pointRadius(() => 0.1) // Marker size, adjust as needed
        .pointsData(images)
        .pointLabel(() => "") // Remove default label

      // Add circular image markers
      globe.pointsData(images).pointLabel(() => "");
      
      // Apply custom image markers using the pointLabel function
      globe.pointLabel(
        (d) => `
          <div style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; border: 2px solid white; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);">
            <img src="${d.image_url}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <span>📍 ${d.latitude.toFixed(4)}, ${d.longitude.toFixed(4)}</span>
        `
      );

      // Globe settings
      globe.controls().autoRotate = false;
      globe.controls().autoRotateSpeed = 0.0;
      globe.pointOfView({ lat: 20.59, lng: 78.96, altitude: 2.8 });
    }
  }, [images]);

  return <div ref={globeRef} className="absolute inset-0 z-0" />;
}
