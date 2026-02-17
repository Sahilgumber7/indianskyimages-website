"use client";

import { useEffect, useRef } from "react";
import { useImages } from "../hooks/useImage";

export default function GlobeView() {
  const globeRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const { images } = useImages({ enabled: true });

  useEffect(() => {
    if (!globeRef.current || images.length === 0) {
      return;
    }

    let mounted = true;

    async function initGlobe() {
      const { default: Globe } = await import("globe.gl");
      if (!mounted || !globeRef.current) {
        return;
      }

      const globe = Globe()(globeRef.current)
        .globeImageUrl("/assets/globe/earth-dark.jpg")
        .bumpImageUrl("/assets/globe/earth-topology.png")
        .backgroundImageUrl(null)
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
                <img src="${d.image_url}" loading="lazy" decoding="async" style="width: 100%; height: 100%; object-fit: cover;" />
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

      globe.showAtmosphere(true);
      globe.atmosphereColor("#ffffff");
      globe.atmosphereAltitude(0.12);

      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.4;
      globe.controls().enableZoom = true;
      globe.controls().enablePan = true;
      globe.controls().dampingFactor = 0.1;

      globe.pointOfView({ lat: 20.59, lng: 78.96, altitude: 2.5 });

      const handleResize = () => {
        globe.width(window.innerWidth);
        globe.height(window.innerHeight);
      };

      handleResize();
      window.addEventListener("resize", handleResize);
      globeInstanceRef.current = { globe, handleResize };
    }

    initGlobe();

    return () => {
      mounted = false;
      const instance = globeInstanceRef.current;
      if (instance) {
        window.removeEventListener("resize", instance.handleResize);
      }
      if (globeRef.current) {
        globeRef.current.innerHTML = "";
      }
    };
  }, [images]);

  return (
    <div
      ref={globeRef}
      className="fixed inset-0 z-0 w-full h-full overflow-hidden animate-in fade-in duration-1000"
      style={{ touchAction: "none" }}
    />
  );
}

