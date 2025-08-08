"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ dialogOpen, darkMode }) {
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
                     <img src="${img.url}" class="w-full h-full object-cover scale-250" />
                   </div>`,
            iconSize: [64, 64],
            iconAnchor: [24, 24],
          });

          return (
            <Marker key={img._id} position={[img.latitude, img.longitude]} icon={customIcon}>
              <Popup className="custom-popup">
                <div
                  className="p-3 rounded-md max-w-sm w-full"
                  style={{
                    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                    color: darkMode ? "#FFFFFF" : "#000000",
                    borderRadius: "8px",
                    boxShadow: "none",
                  }}
                >
                  <img
                    src={img.url}
                    alt="Sky"
                    className="w-full h-72 rounded-md object-cover"
                  />
                  <p className="text-xs sm:text-sm mt-2 text-center">
                    📍 {img.latitude}, {img.longitude}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {dialogOpen && <div className="absolute inset-0 bg-black/30 z-20 pointer-events-auto" />}
    </div>
  );
}
