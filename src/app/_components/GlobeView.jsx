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
    if (images.length > 0 && globeRef.current) {
      const globe = Globe()(globeRef.current)
        .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
        .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
        .pointLat((d) => d.latitude)
        .pointLng((d) => d.longitude)
        .pointColor(() => "#00bfff")
        .pointAltitude(() => 0.01)
        .pointLabel((d) => {
          return `
            <div style="text-align: center; max-width: 90vw;">
              <div style="
                width: 60px;
                height: 60px;
                border-radius: 50%;
                overflow: hidden;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                margin: auto;
              ">
                <img src="${d.image_url}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <br/>
              <span style="font-size: 0.8rem;">📍 ${d.latitude.toFixed(4)}, ${d.longitude.toFixed(4)}</span>
            </div>
          `;
        })
        .pointsData(images);

      // Controls
      globe.controls().autoRotate = false;
      globe.controls().autoRotateSpeed = 0.0;
      globe.controls().enableZoom = true;
      globe.controls().enablePan = true;

      // Initial camera view
      globe.pointOfView({ lat: 20.59, lng: 78.96, altitude: 2.8 });

      // Handle window resizing
      const handleResize = () => {
        globe.width(window.innerWidth);
        globe.height(window.innerHeight);
      };

      window.addEventListener("resize", handleResize);
      handleResize();

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [images]);

  return (
    <div
      ref={globeRef}
      className="fixed inset-0 z-0 w-full h-full overflow-hidden"
      style={{ touchAction: "none" }}
    />
  );
}

