"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView() {
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

  const createIcon = (url) =>
    L.divIcon({
      className: "custom-marker",
      html: `<div class="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
               <img src="${url}" class="w-full h-full object-cover" />
             </div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[20.5937, 78.9629]} // center on India
        zoom={5}
        className="w-full h-full"
        minZoom={3}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {images.map((img) => (
          <Marker
            key={img._id}
            position={[parseFloat(img.latitude), parseFloat(img.longitude)]}
            icon={createIcon(img.url)}
          >
            <Popup>
              <div className="p-2 rounded-md bg-white text-black">
                <img
                  src={img.url}
                  alt="Sky"
                  className="w-48 h-48 object-cover rounded-md"
                />
                <p className="text-sm mt-2">
                  📍 {img.latitude.toFixed(5)}, {img.longitude.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
