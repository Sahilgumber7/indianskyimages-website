"use client";

import { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";

export default function GlobeView() {
  const globeRef = useRef();
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch("/api/images");
        const json = await res.json();
        if (res.ok) setImages(json.data);
        else console.error("Failed to fetch:", json.error);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length > 0 && globeRef.current) {
      const globe = Globe()(globeRef.current)
        // Monochromatic Globe Aesthetic
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-dark.jpg")
        .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
        .backgroundImageUrl(null) // Transparent to show SkyPulse
        .backgroundColor("rgba(0,0,0,0)")
        .pointLat((d) => d.latitude)
        .pointLng((d) => d.longitude)
        .pointColor(() => "#ffffff")
        .pointRadius(0.6)
        .pointsTransitionDuration(1500)
        .pointAltitude(0.01)
        .pointLabel((d) => {
          return `
            <div style="
              background: rgba(0, 0, 0, 0.85);
              backdrop-filter: blur(12px);
              padding: 16px;
              border-radius: 24px;
              border: 1px solid rgba(255, 255, 255, 0.15);
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(255,255,255,0.05);
              color: white;
              font-family: 'Inter', sans-serif;
              min-width: 180px;
              animation: globeLabelIn 0.4s cubic-bezier(0.23, 1, 0.32, 1);
            ">
              <style>
                @keyframes globeLabelIn {
                  from { opacity: 0; transform: translateY(10px) scale(0.95); }
                  to { opacity: 1; transform: translateY(0) scale(1); }
                }
              </style>
              <div style="
                width: 100%;
                height: 120px;
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: 12px;
                border: 1px solid rgba(255,255,255,0.1);
              ">
                <img src="${d.image_url}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <div style="font-weight: 800; font-size: 14px; letter-spacing: -0.02em; margin-bottom: 4px; color: #fff;">
                ${d.location_name || d.locationName || "Somewhere in India"}
              </div>
              <div style="font-size: 10px; opacity: 0.5; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">
                By ${d.uploaded_by || "Anonymous"}
              </div>
            </div>
          `;
        })
        .pointsData(images);

      // Monochromatic Atmosphere
      globe.showAtmosphere(true);
      globe.atmosphereColor("#ffffff");
      globe.atmosphereAltitude(0.12);

      // Controls
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.4;
      globe.controls().enableZoom = true;
      globe.controls().enablePan = true;
      globe.controls().dampingFactor = 0.1;

      // Dark theme for controls
      globe.pointOfView({ lat: 20.59, lng: 78.96, altitude: 2.5 });

      // Handle window resizing
      const handleResize = () => {
        globe.width(window.innerWidth);
        globe.height(window.innerHeight);
      };

      window.addEventListener("resize", handleResize);
      handleResize();

      return () => {
        window.removeEventListener("resize", handleResize);
        if (globeRef.current) globeRef.current.innerHTML = "";
      };
    }
  }, [images]);

  return (
    <div
      ref={globeRef}
      className="fixed inset-0 z-0 w-full h-full overflow-hidden animate-in fade-in duration-1000"
      style={{ touchAction: "none" }}
    />
  );
}
