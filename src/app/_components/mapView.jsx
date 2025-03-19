"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabase";

export default function MapView({ dialogOpen }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function fetchImages() {
      const { data, error } = await supabase.from("images").select("*");
      if (!error) setImages(data);
    }
    fetchImages();
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer center={[20.5937, 78.9629]} zoom={5} className="w-full h-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {images.map((img) => {
          
          const customIcon = new L.DivIcon({
            className: "custom-marker",
            html: `<div class="w-12 h-12 flex items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-md">
                     <img src="${img.image_url}" class="w-full h-full object-cover scale-150" />
                   </div>`,
            iconSize: [64, 64], // Ensures proper size for the marker
            iconAnchor: [24, 24], // Keeps it centered
          });
          
          
          

          return (
            <Marker key={img.id} position={[img.latitude, img.longitude]} icon={customIcon}>
              <Popup>
                <img src={img.image_url} alt="Sky" className="w-full h-80 rounded-md" />
                <p className="text-sm text-gray-600 mt-2">📍 {img.latitude}, {img.longitude}</p>
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
