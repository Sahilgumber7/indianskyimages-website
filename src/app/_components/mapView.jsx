"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabase";

export default function MapView({ dialogOpen }) {
  const [images, setImages] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Fetch images from Supabase
    async function fetchImages() {
      const { data, error } = await supabase.from("images").select("*");
      if (!error) setImages(data);
    }
    fetchImages();

    // Check dark mode from localStorage
    const storedTheme = localStorage.getItem("theme");
    setDarkMode(storedTheme === "dark");
  }, []);

  // Tile URLs for light & dark mode
  const lightMap = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkMap = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer center={[20.5937, 78.9629]} zoom={5} className="w-full h-full">
        <TileLayer url={darkMode ? darkMap : lightMap} />

        {images.map((img) => {
          const customIcon = new L.DivIcon({
            className: "custom-marker",
            html: `<div class="w-12 h-12 flex items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-md">
                     <img src="${img.image_url}" class="w-full h-full object-cover scale-150" />
                   </div>`,
            iconSize: [64, 64],
            iconAnchor: [24, 24],
          });

          return (
            <Marker key={img.id} position={[img.latitude, img.longitude]} icon={customIcon}>
              <Popup className={darkMode ? "dark-popup" : "light-popup"}>
                <div className={`p-3 rounded-md ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
                  <img src={img.image_url} alt="Sky" className="w-full h-80 rounded-md" />
                  <p className="text-sm mt-2">📍 {img.latitude}, {img.longitude}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Overlay to disable map interactions when dialog is open */}
      {dialogOpen && <div className="absolute inset-0 bg-black/30 z-20 pointer-events-auto" />}
    </div>
  );
}
